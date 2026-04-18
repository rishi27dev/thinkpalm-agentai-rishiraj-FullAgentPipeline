import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateUI(prd: string, config: any) {
    // TODO: Implement streaming AI generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-preview-05-06" });

    const result = await model.generateContentStream([
        // System prompt + PRD
        prd
    ]);

    return result.stream;
}
