const axios = require("axios");
const Doctor = require("../models/Doctor");

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function extractTextFromResponse(data) {
  // Extract text from Gemini API response
  if (!data) return null;
  if (data.candidates && data.candidates.length > 0) {
    const candidate = data.candidates[0];
    if (
      candidate.content &&
      candidate.content.parts &&
      candidate.content.parts.length > 0
    ) {
      return candidate.content.parts[0].text || null;
    }
    // Fallback for other response formats
    return candidate.output || candidate.content || candidate.text || null;
  }
  if (typeof data.text === "string") return data.text;
  if (typeof data.content === "string") return data.content;
  return null;
}

exports.chat = async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res
        .status(400)
        .json({ message: "`message` is required in request body" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "Gemini API key not configured on server" });
    }

    // Fetch real doctors from database
    const doctors = await Doctor.find()
      .select("name department email phone bio")
      .lean();

    // Build doctor information for context
    let doctorInfo = "";
    if (doctors && doctors.length > 0) {
      doctorInfo = "\n\nHere is our current list of doctors:\n";
      const doctorsByDept = {};
      doctors.forEach((doc) => {
        const dept = doc.department || "General";
        if (!doctorsByDept[dept]) doctorsByDept[dept] = [];
        doctorsByDept[dept].push(doc);
      });

      for (const [dept, docs] of Object.entries(doctorsByDept)) {
        doctorInfo += `\n${dept}:\n`;
        docs.forEach((doc) => {
          doctorInfo += `- Dr. ${doc.name}`;
          if (doc.phone) doctorInfo += ` (Phone: ${doc.phone})`;
          if (doc.email) doctorInfo += ` (Email: ${doc.email})`;
          doctorInfo += "\n";
        });
      }
    } else {
      doctorInfo =
        "\n\nCurrently, no doctor information is available in our system. Please contact the hospital reception for doctor details.";
    }

    // Build endpoint - using Google's Gemini API v1beta
    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    console.log("[CHATBOT] Using model:", model);

    // Provide a short system-like instruction to bias helpfulness for hospital queries
    const promptText = `You are a helpful hospital assistant. Answer user questions about diseases, doctor availability, clinic timings, appointments, and general patient guidance in a concise and polite way.

IMPORTANT RULES:
- ONLY provide information about doctors that are listed below. DO NOT make up or invent doctor names.
- If asked about doctors or departments not in the list, politely say they should contact reception for more information.
- Keep responses concise and helpful.
- If asked about medical advice, remind the user to consult a professional when needed.
${doctorInfo}

User Question: ${message}

Please provide a helpful response based ONLY on the information provided above.`;

    const body = {
      contents: [
        {
          parts: [
            {
              text: promptText,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 300,
      },
    };

    const resp = await axios.post(endpoint, body, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 20000,
    });

    const text =
      extractTextFromResponse(resp.data) || JSON.stringify(resp.data);

    return res.json({ reply: String(text) });
  } catch (err) {
    console.error("chatbot error:", err && err.message);
    const status = err.response?.status || 500;
    const data = err.response?.data || { message: err.message };
    return res.status(status).json({ error: true, details: data });
  }
};
