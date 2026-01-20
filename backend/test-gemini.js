const axios = require("axios");

(async () => {
  try {
    const key = process.env.GEMINI_API_KEY || "<PUT_KEY_HERE>";
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    console.log("Endpoint:", endpoint);
    const body = {
      contents: [{ parts: [{ text: "Hello from test script" }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 100 },
    };

    const resp = await axios.post(endpoint, body, {
      headers: { "Content-Type": "application/json" },
      timeout: 20000,
    });
    console.log("Status:", resp.status);
    console.log("Data:", JSON.stringify(resp.data, null, 2));
  } catch (err) {
    console.error("Request failed:", err.message);
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Headers:", err.response.headers);
      try {
        console.error("Body:", JSON.stringify(err.response.data, null, 2));
      } catch (e) {
        console.error("Body (raw):", err.response.data);
      }
    } else if (err.request) {
      console.error("No response. Request details:", err.request);
    }
    process.exit(1);
  }
})();
