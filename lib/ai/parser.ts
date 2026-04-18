import { ComponentNode } from "@/types";

export function parseAiOutput(output: string): ComponentNode[] {
    // TODO: Implement robust JSON parsing logic
    try {
        return JSON.parse(output);
    } catch (e) {
        console.error("Failed to parse AI output", e);
        return [];
    }
}
