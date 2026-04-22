import { AgentResult, AgentContext } from '../types/agents';
import { ComponentNode, ParsedPrd } from '../types';
import { updateSession } from '../memory/sessionStore';

/**
 * Agent 2: Component Hierarchy Planner
 */
export const planArchitecture = async (ctx: AgentContext): Promise<AgentResult> => {
    const startTime = Date.now();
    const parsedPrd = ctx.session.parsedPrd;
    const toolCalls: any[] = [];

    if (!parsedPrd) {
        throw new Error('Parsed PRD not found in session. Analyst must run first.');
    }

    ctx.emit({ type: 'thought', agent: 'Architect', text: 'You are a React architecture expert who follows atomic design strictly. Reading parsed PRD and analyst thoughts.' });

    // Step 2: Read analyst's scratchpad entries for context
    const analystThoughts = ctx.scratchpad.readByAgent('PRD Analyst');
    const thoughtCtx = analystThoughts.map(t => t.thought).join('\n');

    try {
        // Step 3: Call component_tree_builder tool
        const builder = ctx.tools.get('component_tree_builder');
        if (!builder) throw new Error('component_tree_builder tool not found');

        const componentTree = await builder.execute(parsedPrd, ctx);
        toolCalls.push({ toolName: 'component_tree_builder', input: { parsedPrd }, output: componentTree, durationMs: 0 });

        const rootNode = componentTree as ComponentNode;

        // Step 4: Write componentTree to ctx.session
        updateSession(ctx.sessionId, { componentTree: rootNode });

        // Step 5: Emit thought for each top-level page/screen found
        rootNode.children.filter(c => c.type === 'page').forEach(page => {
            ctx.emit({ type: 'thought', agent: 'Architect', text: `Planning detailed architecture for screen: ${page.name}` });
        });

        // Step 6: If tree depth > 5 or node count > 30, emit a warning thought and simplify
        const countNodes = (node: ComponentNode): number => 1 + (node.children?.reduce((acc, child) => acc + countNodes(child), 0) || 0);
        const getDepth = (node: ComponentNode): number => 1 + (node.children?.reduce((acc, child) => Math.max(acc, getDepth(child)), 0) || 0);

        const totalNodes = countNodes(rootNode);
        const depth = getDepth(rootNode);

        if (depth > 5 || totalNodes > 30) {
            ctx.emit({ type: 'thought', agent: 'Architect', text: `WARNING: Complex architecture detected (Depth: ${depth}, Nodes: ${totalNodes}). Simplifying where possible.` });
        }

        ctx.scratchpad.append({
            agentName: 'Architect',
            thought: `Architecture plan complete. Total components: ${totalNodes}, Max depth: ${depth}.`,
            timestamp: new Date().toISOString()
        });

        return {
            agentName: 'Architect',
            success: true,
            output: rootNode,
            toolCalls,
            thoughtLog: [`Architecture structured with ${totalNodes} components.`],
            durationMs: Date.now() - startTime,
            tokensUsed: Math.max(1, Math.ceil(JSON.stringify(rootNode).length / 4)),
        };

    } catch (error: any) {
        ctx.emit({ type: 'error', agent: 'Architect', message: error.message });
        return {
            agentName: 'Architect',
            success: false,
            output: null,
            toolCalls,
            thoughtLog: [error.message],
            durationMs: Date.now() - startTime,
            tokensUsed: Math.max(1, Math.ceil((parsedPrd?.screens.join(' ').length || 0) / 4)),
        };
    }
};
