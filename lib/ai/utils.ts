/**
 * Robustly extracts the first JSON object from a string that might contain markdown or other text.
 */
export function extractJson<T = any>(raw: string): T {
    // 1. Clean up common markdown wrapping
    let cleaned = raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

    // 2. If it's already a perfect object string, try parsing it directly
    if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
        try {
            return JSON.parse(cleaned);
        } catch (e) {
            // If direct parse fails, try the more aggressive search below
        }
    }

    // 3. Find the first '{' and the last '}'
    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        throw new Error(`No JSON object found in response: ${raw.slice(0, 100)}...`);
    }

    const potentialJson = cleaned.slice(startIndex, endIndex + 1);

    try {
        return JSON.parse(potentialJson);
    } catch (error: any) {
        // 4. Last ditch effort: try to clean up trailing commas or basic malformations if needed
        // For now, let's just throw a descriptive error
        throw new Error(`Failed to parse extracted JSON: ${error.message}\nExtracted string: ${potentialJson.slice(0, 100)}...`);
    }
}
