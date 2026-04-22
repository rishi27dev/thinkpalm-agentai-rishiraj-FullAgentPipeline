import { ToolDefinition } from '../types/agents';
import { vectorStore } from '../memory/vectorStore';
import { VectorEntry } from '../types/memory';

/**
 * Tool for retrieving similar past projects from semantic memory.
 */
export const memoryRetriever: ToolDefinition<{ prdText: string }, VectorEntry[]> = {
    name: 'memory_retriever',
    description: 'Searches vector memory for past PRDs similar to current input. Returns top 3 matches with similarity scores.',
    inputSchema: {
        type: 'object',
        properties: {
            prdText: { type: 'string', description: 'The raw text of the PRD to search for' },
        },
        required: ['prdText'],
    },
    outputSchema: {
        type: 'array',
        description: 'List of similar past PRD entries',
    },
    async execute(input) {
        const results = await vectorStore.search(input.prdText, 3);
        return results;
    },
};
