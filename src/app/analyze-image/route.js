import { OpenAI } from "openai";

export async function POST(req) {
    try {
        const { base64Image, description } = await req.json();

        const openai = new OpenAI({
            apiKey: "process.env.OPENAPI_KEY",
            dangerouslyAllowBrowser: true
          });

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: description },
                        { type: "image_url", image_url: { url: base64Image } } // ✅ Fix applied here
                    ],
                },
            ],
            max_tokens: 500,
        });

        return Response.json({ description: response.choices[0]?.message?.content || "No description available." });
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
