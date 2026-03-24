import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history } = req.body;
    // ✅ Validate input
if (!message || typeof message !== "string") {
  return res.status(400).json({ error: "Invalid input" });
}

// ✅ Block sensitive data in chat
const sensitivePatterns = /(\b\d{7,}\b)|phone|email|address|ssn|credit card|bank|medical|diagnosis|treatment|@/i;

if (sensitivePatterns.test(message)) {
  return res.json({
    reply: "For privacy and safety, please use our Smart Assessment form so we can assist you properly."
  });
}

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        ...(history || []),
        { role: "user", parts: [{ text: message }] },
      ],
    });

    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

    res.status(200).json({ reply: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Chat failed" });
  }
}
