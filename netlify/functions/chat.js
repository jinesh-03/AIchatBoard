// netlify/functions/api/chat.js
const Groq = require("groq-sdk");

// Initialize Groq client
let groq;
try {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
} catch (error) {
  console.error("Failed to initialize Groq:", error);
}

exports.handler = async (event) => {
  // Log for debugging
  console.log("Chat function invoked");
  console.log("Method:", event.httpMethod);
  console.log("Has API Key:", !!process.env.GROQ_API_KEY);

  // Handle CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Messages array is required" }),
      };
    }

    // Check if API key is set
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "API key missing" }),
      };
    }

    // Check if Groq client is initialized
    if (!groq) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Groq client not initialized" }),
      };
    }

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. Provide clear, concise, and accurate responses.",
        },
        ...messages,
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content =
      completion.choices[0]?.message?.content || "No response generated.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        content,
        model: completion.model,
        usage: completion.usage,
      }),
    };
  } catch (error) {
    console.error("Error details:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || "Failed to get response from AI",
      }),
    };
  }
};
