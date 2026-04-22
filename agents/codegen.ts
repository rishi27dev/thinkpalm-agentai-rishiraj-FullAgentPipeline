import { AgentResult, AgentContext } from '../types/agents';
import { generateWithModel } from '../lib/ai/provider';
import { SYSTEM_PROMPT_CODE_GEN } from '../lib/ai/prompts';
import { ComponentNode } from '../types';
import { updateSession } from '../memory/sessionStore';

/**
 * Agent 3: TSX Code Generator
 */
export const generateCode = async (ctx: AgentContext): Promise<AgentResult> => {
    const startTime = Date.now();
    const componentTree = ctx.session.componentTree;
    const toolCalls: any[] = [];
    const thoughtLog: string[] = [];

    if (!componentTree) {
        throw new Error('Component tree not found in session.');
    }

    ctx.emit({ type: 'thought', agent: 'Codegen', text: 'You are an expert React + TypeScript + Tailwind developer. Starting code generation.' });

    // Step 2: Walk the tree, collect all leaf nodes (atoms + components)
    const leaves: ComponentNode[] = [];
    const collectLeaves = (node: ComponentNode) => {
        if (!node.children || node.children.length === 0 || node.type === 'atom' || node.type === 'component') {
            leaves.push(node);
        }
        if (node.children) {
            node.children.forEach(collectLeaves);
        }
    };
    collectLeaves(componentTree);

    const generatedCode: Record<string, string> = { ...ctx.session.generatedCode };

    try {
        const linter = ctx.tools.get('code_linter');
        if (!linter) throw new Error('code_linter tool not found');

        for (const leaf of leaves) {
            let attempt = 0;
            let success = false;
            let code = '';
            let issues: string[] = [];

            while (attempt < 2 && !success) {
                const userPrompt = attempt === 0
                    ? `Generate code for component: ${leaf.name}\nDescription: ${leaf.description}\nType: ${leaf.type}\nTailwind: ${leaf.tailwindClasses.join(' ')}`
                    : `Fix the following issues in the code for ${leaf.name}:\nIssues: ${issues.join(', ')}\n\nOriginal Code:\n${code}`;

                code = await generateWithModel(ctx.session.config.model, SYSTEM_PROMPT_CODE_GEN, userPrompt, false, 0.25);

                // Step 3: Call code_linter tool
                const lintResult: any = await linter.execute({ code }, ctx);
                toolCalls.push({ toolName: 'code_linter', input: { code: '...' }, output: lintResult, durationMs: 0 });

                if (lintResult.score >= 70) {
                    success = true;
                } else {
                    issues = lintResult.issues;
                    attempt++;
                }
            }

            // Step 5: Store all code in ctx.session.generatedCode
            generatedCode[leaf.name] = code;

            // Step 6: Emit a tool_call event for every component generated
            ctx.emit({
                type: 'thought',
                agent: 'Codegen',
                text: `Generated code for ${leaf.name}. Linter score: ${success ? 'PASSED' : 'FALLBACK'}`
            });

            // Re-use tool_call event type as requested (though it's usually for real tools, I'll emit a "virtual" one if needed, 
            // but the prompt says "Emit a tool_call event for every component generated")
            ctx.emit({
                type: 'tool_call',
                call: {
                    toolName: 'LLM_CodeGen',
                    input: { component: leaf.name },
                    output: { length: code.length },
                    durationMs: 0
                }
            });
        }

        updateSession(ctx.sessionId, { generatedCode });

        return {
            agentName: 'Codegen',
            success: true,
            output: { generatedCode },
            toolCalls,
            thoughtLog,
            durationMs: Date.now() - startTime,
            tokensUsed: Math.max(1, Math.ceil(JSON.stringify(generatedCode).length / 4)),
        };

    } catch (error: any) {
        ctx.emit({ type: 'error', agent: 'Codegen', message: error.message });
        return {
            agentName: 'Codegen',
            success: false,
            output: null,
            toolCalls,
            thoughtLog: [error.message],
            durationMs: Date.now() - startTime,
            tokensUsed: Math.max(1, Math.ceil((error.message || '').length / 4)),
        };
    }
};
