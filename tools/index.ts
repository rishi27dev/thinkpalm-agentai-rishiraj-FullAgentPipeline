import { ToolDefinition } from '../types/agents';
import { prdParser } from './prdParser';
import { treeBuilder } from './treeBuilder';
import { codeLinter } from './linter';
import { memoryRetriever } from './memoryRetriever';
import { exportPackager } from './exportPackager';

/**
 * Registry of all available tools mapped by their unique names.
 */
export const toolRegistry = new Map<string, ToolDefinition<any, any>>([
    [prdParser.name, prdParser],
    [treeBuilder.name, treeBuilder],
    [codeLinter.name, codeLinter],
    [memoryRetriever.name, memoryRetriever],
    [exportPackager.name, exportPackager],
]);

/**
 * Returns an array of all registered tool definitions.
 * Useful for initializing agents with a set of tools.
 */
export const getTools = (): ToolDefinition<any, any>[] => {
    return Array.from(toolRegistry.values());
};

// Export individual tools for specific imports
export { prdParser, treeBuilder, codeLinter, memoryRetriever, exportPackager };
