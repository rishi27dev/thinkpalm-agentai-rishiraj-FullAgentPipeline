import { PipelineInput, PipelineEvent, AgentContext, AgentResult, PipelineRun, ReviewReport, ReviewIssue } from '../types/agents';
import { GenerationConfig, ParsedPrd, ComponentNode, GenerationResult } from '../types';
import { analyzePRD } from './analyst';
import { planArchitecture } from './architect';
import { generateCode } from './codegen';
import { reviewCode } from './reviewer';
import { sessionStore, updateSession, getSession } from '../memory/sessionStore';
import { createScratchpadStore } from '../memory/scratchpad';
import { toolRegistry } from '../tools';
import { vectorStore } from '../memory/vectorStore';

// Simple nanoid replacement
const nanoid = () => `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Tracking active runs and cancellations
const activeRuns = new Map<string, PipelineRun>();
const cancellationFlags = new Set<string>();

const attachGeneratedCode = (
    node: ComponentNode,
    generatedCode: Record<string, string>
): ComponentNode => {
    const codeByName = generatedCode[node.name];
    const codeById = generatedCode[node.id];
    const resolvedCode = codeByName || codeById || node.code || '';

    return {
        ...node,
        code: resolvedCode,
        children: (node.children || []).map((child) => attachGeneratedCode(child, generatedCode)),
    };
};

/**
 * Master Pipeline Orchestrator
 */
export async function* runPipeline(input: PipelineInput, config: GenerationConfig): AsyncGenerator<PipelineEvent> {
    const runId = nanoid();
    const { sessionId, prdText } = input;
    const startTime = new Date().toISOString();

    // 1. Create or resume SessionStore entry for sessionId
    let session = getSession(sessionId);
    if (!session) {
        session = sessionStore.create(sessionId, { prdText, config });
    } else {
        session = updateSession(sessionId, { prdText, config });
    }

    // 2. Create a fresh ScratchpadStore for this run
    const scratchpad = createScratchpadStore(sessionId);
    const agentResults: AgentResult[] = [];

    const run: PipelineRun = {
        id: runId,
        startedAt: startTime,
        completedAt: '',
        agents: agentResults,
        finalOutput: {} as GenerationResult,
    };
    activeRuns.set(runId, run);

    const checkCancellation = () => {
        if (cancellationFlags.has(runId)) {
            throw new Error(`Pipeline run ${runId} was cancelled.`);
        }
    };

    /**
     * Internal helper to run an agent with timing
     */
    const executeAgent = async (
        agentFn: (ctx: AgentContext) => Promise<AgentResult>,
        ctx: AgentContext
    ): Promise<AgentResult> => {
        const start = Date.now();
        const result = await agentFn(ctx);
        result.durationMs = Date.now() - start;
        return result;
    };

    const createCtx = (emit: (event: PipelineEvent) => void): AgentContext => ({
        sessionId,
        pipelineRunId: runId,
        session: getSession(sessionId)!,
        scratchpad,
        tools: toolRegistry,
        orchestrator: {
            runRevision: async (issues: ReviewIssue[]) => {
                // This is a stub to satisfy types; the actual loop is handled in the generator
                return { agentName: 'RevisionTrigger', success: true } as AgentResult;
            }
        },
        emit,
    });

    try {
        checkCancellation();

        // --- PHASE 1: Analyst ---
        yield { type: 'agent_start', agent: 'analyst', timestamp: new Date().toISOString() };
        const analystResult = await executeAgent(analyzePRD, createCtx((ev) => { }));
        agentResults.push(analystResult);
        yield { type: 'agent_done', result: analystResult };
        if (!analystResult.success) {
            const reason = analystResult.thoughtLog?.[0] || 'Unknown analyst error';
            throw new Error(`Analyst phase failed: ${reason}`);
        }
        checkCancellation();

        // --- PHASE 2: Architect ---
        yield { type: 'agent_start', agent: 'architect', timestamp: new Date().toISOString() };
        const architectResult = await executeAgent(planArchitecture, createCtx((ev) => { }));
        agentResults.push(architectResult);
        yield { type: 'agent_done', result: architectResult };
        if (!architectResult.success) {
            const reason = architectResult.thoughtLog?.[0] || 'Unknown architect error';
            throw new Error(`Architect phase failed: ${reason}`);
        }
        checkCancellation();

        // --- PHASE 3: Codegen & Review ---
        let revisionPerformed = false;
        let approved = false;
        let lastReviewReport: ReviewReport | null = null;

        while (!approved) {
            // Run Codegen
            yield { type: 'agent_start', agent: 'codegen', timestamp: new Date().toISOString() };
            const codegenResult = await executeAgent(generateCode, createCtx((ev) => { }));
            agentResults.push(codegenResult);
            yield { type: 'agent_done', result: codegenResult };
            if (!codegenResult.success) {
                const reason = codegenResult.thoughtLog?.[0] || 'Unknown codegen error';
                throw new Error(`Codegen phase failed: ${reason}`);
            }
            checkCancellation();

            // Run Reviewer
            yield { type: 'agent_start', agent: 'reviewer', timestamp: new Date().toISOString() };
            const reviewerResult = await executeAgent(reviewCode, createCtx((ev) => { }));
            agentResults.push(reviewerResult);
            yield { type: 'agent_done', result: reviewerResult };
            if (!reviewerResult.success) {
                const reason = reviewerResult.thoughtLog?.[0] || 'Unknown reviewer error';
                throw new Error(`Reviewer phase failed: ${reason}`);
            }
            checkCancellation();

            const report = reviewerResult.output as ReviewReport;
            lastReviewReport = report;
            if (report.approved) {
                approved = true;
            } else if (!revisionPerformed) {
                revisionPerformed = true;
                yield { type: 'thought', agent: 'orchestrator', text: 'Reviewer rejected code. Starting targeted revision loop.' };
                // Loop continues
            } else {
                const hasBlockingErrors = Array.isArray(report.issues)
                    ? report.issues.some((issue) => issue.severity === 'error')
                    : true;
                const goodEnough = report.overallScore >= 75 && !hasBlockingErrors;

                if (goodEnough) {
                    approved = true;
                    yield {
                        type: 'thought',
                        agent: 'orchestrator',
                        text: 'Reviewer still flagged minor issues after revision. Proceeding with current output (score threshold met, no blocking errors).',
                    };
                } else {
                    throw new Error('Pipeline failed to produce approved code after revision.');
                }
            }
        }

        // 7. Persist to vector store
        const finalSession = getSession(sessionId)!;
        await vectorStore.add(prdText, `UI generated for ${finalSession.parsedPrd?.appName || 'unknown app'}`);

        // 8. Yield final event
        run.completedAt = new Date().toISOString();
        const hydratedTree = attachGeneratedCode(finalSession.componentTree!, finalSession.generatedCode);
        run.finalOutput = {
            tree: hydratedTree,
            metadata: {
                totalComponents: Object.keys(finalSession.generatedCode).length,
                estimatedTokens: 0,
                screens: finalSession.parsedPrd?.screens || [],
            },
            rawPrompt: '',
        };

        yield { type: 'done', run };

    } catch (error: any) {
        yield { type: 'error', agent: 'orchestrator', message: error.message };
        run.completedAt = new Date().toISOString();
    } finally {
        activeRuns.set(runId, run);
        cancellationFlags.delete(runId);
    }
}

/**
 * Retrieves the status of a specific pipeline run.
 */
export function getPipelineStatus(runId: string): PipelineRun | undefined {
    return activeRuns.get(runId);
}

/**
 * Requests cancellation of a specific pipeline run.
 */
export function cancelPipeline(runId: string): void {
    cancellationFlags.add(runId);
}
