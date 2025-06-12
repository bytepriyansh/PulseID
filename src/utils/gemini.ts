
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export async function streamRiskAnalysis(input: string, onChunk: (text: string) => void): Promise<void> {
    const model = "gemini-1.5-flash";

    const config = {
        responseMimeType: "text/plain",
    };

    const contents = [
        {
            role: "user",
            parts: [
                {
                    text: input,
                },
            ],
        },
    ];

    const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
    });

    for await (const chunk of response) {
        if (chunk?.text) onChunk(chunk.text);
    }
}
