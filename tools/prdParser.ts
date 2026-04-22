import { z } from 'zod';
import { ToolDefinition, ToolError } from '../types/agents';
import { generateWithModel } from '../lib/ai/provider';
import { extractJson } from '../lib/ai/utils';
import { SYSTEM_PROMPT_PARSER } from '../lib/ai/prompts';
import { ParsedPrd } from '../types';

/**
 * Zod schema for validating ParsedPrd output from the LLM.
 */
const ParsedPrdSchema = z.object({
    appName: z.string(),
    screens: z.array(z.string()),
    roles: z.array(z.string()),
    features: z.array(
        z.object({
            name: z.string(),
            description: z.string(),
        })
    ),
    entities: z.array(
        z.object({
            name: z.string(),
            fields: z.array(z.string()),
        })
    ),
});



/**
 * Tool for parsing raw PRD text into structured JSON data.
 */
export const prdParser: ToolDefinition<{ prdText: string }, ParsedPrd> = {
    name: 'prd_parser',
    description: 'Extracts structured data from raw PRD text: app name, screens, user roles, features, data entities',
    inputSchema: {
        type: 'object',
        properties: {
            prdText: { type: 'string', description: 'The raw text of the Product Requirement Document' },
        },
        required: ['prdText'],
    },
    outputSchema: {
        type: 'object',
        description: 'Structured PRD data matching ParsedPrd interface',
    },
    async execute(input, ctx) {
        const response = await generateWithModel(
            ctx.session.config.model,
            SYSTEM_PROMPT_PARSER,
            `PRD CONTENT:\n${input.prdText}`
        );

        try {
            const parsed = extractJson(response);
            return ParsedPrdSchema.parse(parsed);
        } catch (error: any) {
            throw new ToolError('Failed to parse PRD output into structured JSON', {
                originalOutput: response,
                error: error.message,
            });
        }
    },
};
