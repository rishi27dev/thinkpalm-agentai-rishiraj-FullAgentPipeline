import { GoogleGenerativeAI } from "@google/generative-ai";

const FALLBACK_GEMINI_MODEL = "gemini-2.5-flash";
const SUPPORTED_GEMINI_MODELS = new Set([
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite-preview"
]);

export function resolveGeminiModel(model?: string): string {
    if (!model) return FALLBACK_GEMINI_MODEL;
    return SUPPORTED_GEMINI_MODELS.has(model) ? model : FALLBACK_GEMINI_MODEL;
}

export async function generateWithGemini(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    useJson: boolean = true
) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY. Set GEMINI_API_KEY in .env.local.");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const geminiModel = genAI.getGenerativeModel({ model: resolveGeminiModel(model) }, { apiVersion: 'v1beta' });
    const prompt = `${systemPrompt}\n\n${useJson ? "IMPORTANT: Return output as a valid JSON object.\n\n" : ""}${userPrompt}`;

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = result.response;
        return response.text() || "";
    } catch (error: any) {
        if (error.message?.includes('SAFETY')) {
            throw new Error(`Gemini safety filter blocked the response. This is common with "Lite" models when generating complex code. Try a standard model.`);
        }
        if (error.message?.includes('503')) {
            throw new Error(`Gemini Service Unavailable (503). The model is experiencing high demand. Please retry in a few seconds.`);
        }
        throw new Error(`Gemini generation failed: ${error.message}`);
    }
}
