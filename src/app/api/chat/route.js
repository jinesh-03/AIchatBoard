import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Available models
const MODELS = {
  best: "llama-3.3-70b-versatile",
  fast: "llama-3.1-8b-instant",
  balanced: "gemma2-9b-it",
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages, model = "best" } = body;

    const selectedModel = MODELS[model] || MODELS.best;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. Provide clear, concise, and accurate responses.",
        },
        ...messages,
      ],
      model: selectedModel,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return NextResponse.json({
      content:
        completion.choices[0]?.message?.content || "No response generated.",
      model: completion.model,
    });
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get response" },
      { status: 500 },
    );
  }
}
