import { AgentResult, AgentContext, ReviewReport } from '../types/agents';
import { generateWithModel } from '../lib/ai/provider';
import { extractJson } from '../lib/ai/utils';

const normalizeReviewReport = (raw: Partial<ReviewReport>): ReviewReport => {
    const issues = Array.isArray(raw.issues) ? raw.issues : [];
    const overallScore = typeof raw.overallScore === 'number' ? raw.overallScore : 0;
    const suggestions = Array.isArray(raw.suggestions) ? raw.suggestions : [];
    const hasBlockingErrors = issues.some((issue: any) => issue?.severity === 'error');
    const approved =
        typeof raw.approved === 'boolean'
            ? raw.approved
            : overallScore >= 75 && !hasBlockingErrors;

    return {
        overallScore,
        issues,
        suggestions,
        approved: approved || (overallScore >= 75 && !hasBlockingErrors),
    };
};

/**
 * Agent 4: Output Quality Reviewer
 */
export const reviewCode = async (ctx: AgentContext): Promise<AgentResult> => {
    const startTime = Date.now();
    const session = ctx.session;
    const toolCalls: any[] = [];

    ctx.emit({ type: 'thought', agent: 'Reviewer', text: 'You are a code review expert and UX critic. Starting final quality review.' });

    try {
        // Step 2: Build a review prompt listing all components and their linter scores
        // We'll need to gather linter scores from previous thoughts or tool calls if they were saved, 
        // but for this task, I'll list the components and mention their status.
        const componentNames = Object.keys(session.generatedCode);
        const reviewPrompt = `
Review the following React/Tailwind components generated for "${session.parsedPrd?.appName}":
Components: ${componentNames.join(', ')}

PRD Context: ${JSON.stringify(session.parsedPrd)}
Architecture: ${JSON.stringify(session.componentTree)}

Please provide a structured review:
{ "overallScore": number, "issues": [{ "component": string, "severity": "error"|"warning"|"info", "message": string }], "suggestions": string[], "approved": boolean }

Approval rule:
- Set approved=true when there are no severity="error" issues and overallScore >= 75.
- Use approved=false only for true blocking issues.
`;

        // Step 3: Call LLM with a structured review prompt
        const response = await generateWithModel(
            session.config.model,
            "You are a code review expert and UX critic. Be specific, actionable, and consistent with the approval rule.",
            reviewPrompt,
            true,
            0.2
        );
        const reviewReport = normalizeReviewReport(extractJson<Partial<ReviewReport>>(response));

        // Step 4: If approved === false and this is the first review: emit a thought "requesting revision"
        // (Simplified check for 'first review' - we can check scratchpad)
        const previousReviews = ctx.scratchpad.readByAgent('Reviewer');

        if (!reviewReport.approved && previousReviews.length === 0) {
            ctx.emit({ type: 'thought', agent: 'Reviewer', text: 'requesting revision' });
            await ctx.orchestrator.runRevision(reviewReport.issues);
        }

        // Step 5: Write final review to scratchpad
        ctx.scratchpad.append({
            agentName: 'Reviewer',
            thought: `Final Review: Score=${reviewReport.overallScore}, Approved=${reviewReport.approved}. Issues found: ${reviewReport.issues.length}`,
            timestamp: new Date().toISOString()
        });

        // Step 6: Return AgentResult with the ReviewReport as output
        return {
            agentName: 'Reviewer',
            success: true,
            output: reviewReport,
            toolCalls,
            thoughtLog: [`Review completed. Score: ${reviewReport.overallScore}`],
            durationMs: Date.now() - startTime,
            tokensUsed: Math.max(1, Math.ceil(JSON.stringify(reviewReport).length / 4)),
        };

    } catch (error: any) {
        ctx.emit({ type: 'error', agent: 'Reviewer', message: error.message });
        return {
            agentName: 'Reviewer',
            success: false,
            output: null,
            toolCalls,
            thoughtLog: [error.message],
            durationMs: Date.now() - startTime,
            tokensUsed: Math.max(1, Math.ceil((error.message || '').length / 4)),
        };
    }
};
