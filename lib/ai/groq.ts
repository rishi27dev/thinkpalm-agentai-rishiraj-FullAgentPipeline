import Groq from "groq-sdk";

const FALLBACK_GROQ_MODEL = "llama-3.3-70b-versatile";
const SUPPORTED_GROQ_MODELS = new Set([
    "llama-3.3-70b-versatile",
]);

export function resolveGroqModel(model?: string): string {
    if (!model) return FALLBACK_GROQ_MODEL;

    if (SUPPORTED_GROQ_MODELS.has(model)) {
        return model;
    }

    // Map legacy/non-Groq model selections to a safe Groq default.
    return FALLBACK_GROQ_MODEL;
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY,
});

export async function generateWithGroq(model: string, systemPrompt: string, userPrompt: string, useJson: boolean = true, temperature: number = 0.3) {
    if (!process.env.GROQ_API_KEY && !process.env.NEXT_PUBLIC_GROQ_API_KEY) {
        throw new Error("Missing GROQ_API_KEY. Set GROQ_API_KEY in .env.local.");
    }

    const chatCompletion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: useJson ? `${systemPrompt}\n\nIMPORTANT: Return output as a valid JSON object.` : systemPrompt },
            { role: "user", content: userPrompt },
        ],
        model: resolveGroqModel(model),
        temperature: temperature,
        ...(useJson ? { response_format: { type: "json_object" } } : {}),
    });

    return chatCompletion.choices[0]?.message?.content || "";
}
