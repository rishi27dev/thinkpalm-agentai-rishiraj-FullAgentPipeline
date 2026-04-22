import { AgentResult, AgentContext } from '../types/agents';
import { ParsedPrd } from '../types';
import { updateSession } from '../memory/sessionStore';

/**
 * Agent 1: PRD Analyst
 * Analyzes raw PRD text to extract features, screens, and entities.
 */
export const analyzePRD = async (ctx: AgentContext): Promise<AgentResult> => {
    const startTime = Date.now();
    const prdText = ctx.session.prdText;
    const toolCalls: any[] = [];

    ctx.emit({ type: 'thought', agent: 'PRD Analyst', text: 'Starting senior product analyst assessment of the PRD.' });
    ctx.scratchpad.append({ agentName: 'PRD Analyst', thought: 'Initializing analysis phase.', timestamp: new Date().toISOString() });

    try {
        // Step 1: Call memory_retriever tool
        const retriever = ctx.tools.get('memory_retriever');
        const pastPrds = retriever ? await retriever.execute({ prdText }, ctx) : [];
        toolCalls.push({ toolName: 'memory_retriever', input: { prdText }, output: pastPrds, durationMs: 0 });

        // Step 2: Call prd_parser tool
        const parser = ctx.tools.get('prd_parser');
        if (!parser) throw new Error('prd_parser tool not found');

        const result = await parser.execute({ prdText }, ctx);
        toolCalls.push({ toolName: 'prd_parser', input: { prdText }, output: result, durationMs: 0 });

        const parsedPrd = result as ParsedPrd;

        // Step 4: Write to ctx.session
        updateSession(ctx.sessionId, { parsedPrd });

        // Step 5: Emit thought
        const thought = `Identified ${parsedPrd.screens.length} screens, ${parsedPrd.entities.length} entities, ${parsedPrd.roles.length} user roles`;
        ctx.emit({ type: 'thought', agent: 'PRD Analyst', text: thought });

        // Step 6: Write scratchpad entry
        const summary = `Analysis complete for ${parsedPrd.appName}. Extracted ${parsedPrd.features.length} features across ${parsedPrd.screens.length} screens.`;
        ctx.scratchpad.append({ agentName: 'PRD Analyst', thought: summary, timestamp: new Date().toISOString() });

        return {
            agentName: 'PRD Analyst',
            success: true,
            output: parsedPrd,
            toolCalls,
            thoughtLog: [thought, summary],
            durationMs: Date.now() - startTime,
            tokensUsed: Math.max(1, Math.ceil((JSON.stringify(parsedPrd).length + prdText.length) / 4)),
        };

    } catch (error: any) {
        ctx.emit({ type: 'error', agent: 'PRD Analyst', message: error.message });
        return {
            agentName: 'PRD Analyst',
            success: false,
            output: null,
            toolCalls,
            thoughtLog: [error.message],
            durationMs: Date.now() - startTime,
            tokensUsed: Math.max(1, Math.ceil(prdText.length / 4)),
        };
    }
};
