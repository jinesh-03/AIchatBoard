// netlify/functions/api/chat.js
const Groq = require("groq-sdk");

// Initialize Groq client with error handling
let groq;
try {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
} catch (error) {
  console.error("Failed to initialize Groq:", error);
}

exports.handler = async (event, context) => {
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
    // Check if API key exists
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "Server configuration error: API key missing",
        }),
      };
    }

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid JSON body" }),
      };
    }

    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Messages array is required and cannot be empty",
        }),
      };
    }

    // Check if groq is initialized
    if (!groq) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "Groq client not initialized. Check your API key.",
        }),
      };
    }

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. Provide clear, concise, and accurate responses. Be friendly and engaging.",
        },
        ...messages,
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
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
    console.error("Groq API Error:", error);

    // Handle specific errors
    if (error.status === 401) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: "Invalid API key. Please check your GROQ_API_KEY.",
        }),
      };
    }

    if (error.status === 429) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || "Failed to get response from AI",
      }),
    };
  }
};
