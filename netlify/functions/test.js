// netlify/functions/test.js
exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "✅ Netlify function is working!",
      path: event.path,
      method: event.httpMethod,
      time: new Date().toISOString(),
    }),
  };
};
