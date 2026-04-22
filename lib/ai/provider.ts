import { generateWithGroq, resolveGroqModel } from "./groq";
import { generateWithGemini, resolveGeminiModel } from "./gemini";

export const SUPPORTED_MODELS = [
    "llama-3.3-70b-versatile",
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite-preview"
] as const;

export type SupportedModel = typeof SUPPORTED_MODELS[number];

const SUPPORTED_MODELS_SET = new Set<string>(SUPPORTED_MODELS);

export const isGeminiModel = (model: string) => model.startsWith("gemini-");
export const isGroqModel = (model: string) => model.startsWith("llama-");

export const resolveAppModel = (model?: string): SupportedModel => {
    if (!model || !SUPPORTED_MODELS_SET.has(model)) {
        return "gemini-2.5-flash";
    }
    return model as SupportedModel;
};

export async function generateWithModel(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    useJson: boolean = true,
    temperature: number = 0.3
) {
    const resolved = resolveAppModel(model);
    if (isGeminiModel(resolved)) {
        return generateWithGemini(resolveGeminiModel(resolved), systemPrompt, userPrompt, useJson);
    }
    return generateWithGroq(resolveGroqModel(resolved), systemPrompt, userPrompt, useJson, temperature);
}