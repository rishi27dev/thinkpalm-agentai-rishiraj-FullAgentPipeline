import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function generateWithGroq(model: string, systemPrompt: string, userPrompt: string, useJson: boolean = true) {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: useJson ? `${systemPrompt}\n\nIMPORTANT: Return output as a valid JSON object.` : systemPrompt },
            { role: "user", content: userPrompt },
        ],
        model: model,
        temperature: 0.3,
        ...(useJson ? { response_format: { type: "json_object" } } : {}),
    });

    return chatCompletion.choices[0]?.message?.content || "";
}
