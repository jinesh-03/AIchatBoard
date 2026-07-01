// netlify/functions/api/chat.js
exports.handler = async (event) => {
  // Log the request for debugging
  console.log("Chat function called with method:", event.httpMethod);
  console.log("Headers:", event.headers);

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
    console.log("Received body:", body);

    // Return a simple test response for now
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        content:
          "✅ Chat function is working! Your message: " +
          (body.messages?.[0]?.content || "No message"),
        model: "test",
        usage: { total_tokens: 0 },
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Internal error" }),
    };
  }
};
