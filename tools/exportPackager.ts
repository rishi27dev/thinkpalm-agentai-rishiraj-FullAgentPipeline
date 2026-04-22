import { ToolDefinition } from '../types/agents';
import { GenerationResult } from '../types';
import { toZip } from '../lib/export/toZip';
import { toStackBlitz } from '../lib/export/toStackBlitz';

/**
 * Input format for the export packager.
 */
interface ExportInput {
    result: GenerationResult;
    format: 'zip' | 'stackblitz';
}

/**
 * Tool for packaging generated code into downloadable or interactive formats.
 */
export const exportPackager: ToolDefinition<ExportInput, any> = {
    name: 'export_packager',
    description: 'Packages all generated component files into a downloadable ZIP or StackBlitz-ready payload',
    inputSchema: {
        type: 'object',
        properties: {
            result: { type: 'object' },
            format: { type: 'string', enum: ['zip', 'stackblitz'] },
        },
        required: ['result', 'format'],
    },
    outputSchema: {
        type: 'object',
        description: 'Export result with download link or project ID',
    },
    async execute(input) {
        const { result, format } = input;

        if (format === 'zip') {
            const zipBlob = await toZip(result);
            // In a real web app, we'd return a URL or signed S3 link. 
            // For now, we simulate a successful packaging.
            return {
                type: 'zip',
                message: 'Project successfully packaged into ZIP',
                fileCount: Object.keys(result.tree).length, // simplified
            };
        } else {
            const project = await toStackBlitz(result);
            return {
                type: 'stackblitz',
                stackBlitzId: project.title.toLowerCase().replace(/\s+/g, '-'),
                url: `https://stackblitz.com/edit/${project.title.toLowerCase().replace(/\s+/g, '-')}`,
            };
        }
    },
};
