import { z } from 'zod';
import { ToolDefinition, ToolError } from '../types/agents';
import { generateWithModel } from '../lib/ai/provider';
import { extractJson } from '../lib/ai/utils';
import { SYSTEM_PROMPT_ARCHITECT } from '../lib/ai/prompts';
import { ComponentNode, ParsedPrd, PropDef } from '../types';

/**
 * Recursive Zod schema for ComponentNode.
 */
const PropDefSchema = z.object({
    type: z.enum(['string', 'number', 'boolean', 'ReactNode', 'function']),
    required: z.boolean(),
    defaultValue: z.any().optional(),
});

const ComponentNodeSchema: z.ZodType<ComponentNode> = z.lazy(() =>
    z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(['page', 'layout', 'section', 'component', 'atom']),
        description: z.string(),
        props: z.record(z.string(), z.any()).default({}),
        children: z.array(ComponentNodeSchema).default([]),
        tailwindClasses: z.array(z.string()).default([]),
        dependencies: z.array(z.string()).default([]),
        code: z.string().default(''),
    })
);

const createFallbackTree = (input: ParsedPrd): ComponentNode => {
    const pageChildren: ComponentNode[] = input.screens.map((screen, idx) => ({
        id: `page_${idx + 1}`,
        name: screen.replace(/[^\w\s-]/g, '').trim() || `Screen${idx + 1}`,
        type: 'page',
        description: `Page generated from PRD screen "${screen}"`,
        props: {},
        children: [],
        tailwindClasses: ['min-h-screen', 'p-6', 'bg-white'],
        dependencies: [],
        code: '',
    }));

    return {
        id: 'app_root',
        name: input.appName || 'GeneratedApp',
        type: 'layout',
        description: 'Root application layout generated from PRD.',
        props: {},
        children: pageChildren,
        tailwindClasses: ['w-full', 'min-h-screen'],
        dependencies: [],
        code: '',
    };
};

/**
 * Tool for building a ComponentNode tree from parsed PRD data.
 */
export const treeBuilder: ToolDefinition<ParsedPrd, ComponentNode> = {
    name: 'component_tree_builder',
    description: 'Takes ParsedPrd and builds a ComponentNode tree following atomic design principles',
    inputSchema: {
        type: 'object',
        properties: {
            appName: { type: 'string' },
            screens: { type: 'array', items: { type: 'string' } },
            roles: { type: 'array', items: { type: 'string' } },
            features: { type: 'array', items: { type: 'object' } },
            entities: { type: 'array', items: { type: 'object' } },
        },
        required: ['appName', 'screens', 'features'],
    },
    outputSchema: {
        type: 'object',
        description: 'The root ComponentNode of the application tree',
    },
    async execute(input, ctx) {
        const response = await generateWithModel(
            ctx.session.config.model,
            SYSTEM_PROMPT_ARCHITECT,
            `PROJECT DATA:\n${JSON.stringify(input, null, 2)}`
        );

        try {
            const parsed = extractJson(response);
            const rootNode = ComponentNodeSchema.parse(parsed);

            // Recursive helper to count nodes by type
            const stats = { nodes: 0, screens: 0, atoms: 0 };
            const traverse = (node: ComponentNode) => {
                stats.nodes++;
                if (node.type === 'page') stats.screens++;
                if (node.type === 'atom') stats.atoms++;
                node.children.forEach(traverse);
            };
            traverse(rootNode);

            console.log(`[TreeBuilder] Built tree with ${stats.nodes} nodes, ${stats.screens} screens, and ${stats.atoms} atoms.`);

            return rootNode;
        } catch (error: any) {
            console.warn('[TreeBuilder] Falling back to deterministic tree:', error.message);
            const fallbackTree = createFallbackTree(input);
            if (fallbackTree.children.length > 0) {
                return fallbackTree;
            }

            throw new ToolError('Failed to build component tree from architect output', {
                originalOutput: response,
                error: error.message,
            });
        }
    },
};
