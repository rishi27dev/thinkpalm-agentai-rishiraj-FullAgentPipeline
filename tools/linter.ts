import { ToolDefinition } from '../types/agents';

/**
 * Result structure for the linting process.
 */
interface LintResult {
    valid: boolean;
    issues: string[];
    score: number;
}

/**
 * Tool for validating generated TSX code for quality and compliance.
 */
export const codeLinter: ToolDefinition<{ code: string }, LintResult> = {
    name: 'code_linter',
    description: 'Validates generated TSX code for: valid JSX structure, no inline styles, Tailwind class names only, correct TypeScript props interface',
    inputSchema: {
        type: 'object',
        properties: {
            code: { type: 'string', description: 'The TSX code to validate' },
        },
        required: ['code'],
    },
    outputSchema: {
        type: 'object',
        description: 'Validation results with score and identified issues',
    },
    async execute(input) {
        const { code } = input;
        const issues: string[] = [];
        let score = 100;

        // 1. Has "export default function" or "export default const"
        if (!/export\s+default\s+(function|const)/.test(code)) {
            issues.push('Missing default export (function or const)');
            score -= 20;
        }

        // 2. Uses JSX structure (check for basic tags)
        if (!/<[a-zA-Z]+.*>/.test(code) && !/<[a-zA-Z]+\s*\/>/.test(code)) {
            issues.push('Code does not appear to contain valid JSX/TSX tags');
            score -= 20;
        }

        // 3. No style={{ patterns
        if (/style\s*=\s*\{\{/.test(code)) {
            issues.push('Inline styles (style={{...}}) are forbidden. Use Tailwind classes.');
            score -= 30;
        }

        // 4. Has interface or type Props
        if (!/(interface|type)\s+Props/.test(code)) {
            issues.push('Missing "Props" interface or type definition');
            score -= 15;
        }

        // 5. No hardcoded hex colors outside classNames
        const hexMatches = code.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g) || [];
        const colorIssues = hexMatches.filter(hex => {
            // Simple heuristic: if the hex is not inside a className string on the same line
            const line = code.split('\n').find(l => l.includes(hex)) || '';
            return !line.includes('className');
        });

        if (colorIssues.length > 0) {
            const uniqueColors = colorIssues.filter((v, i, a) => a.indexOf(v) === i);
            issues.push(`Hardcoded hex colors found outside classNames: ${uniqueColors.join(', ')}`);
            score -= 15;
        }

        return {
            valid: issues.length === 0,
            issues,
            score: Math.max(0, score),
        };
    },
};
