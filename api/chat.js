import { GoogleGenAI } from "@google/genai";

// 🔒 Simple in-memory rate limiter
const rateLimit = new Map();

const SYSTEM_PROMPT = `
You are a professional AI Care Assistant for Prudent Homecare.

RULES:
- Do NOT ask for personal or sensitive information
- Do NOT provide medical advice, diagnosis, or treatment
- Keep responses general, helpful, and supportive
- Guide users toward Smart Assessment or speaking to a coordinator
- Be warm, human, and professional (not robotic)

GOAL:
Help users understand care options and take the next step safely.
`;

export default async function handler(req, res) {
  // ✅ Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 🔒 Restrict origin (replace with your real domain)
  const allowedOrigin = "https://assistant-delta-two.vercel.app";
  if (req.headers.origin && req.headers.origin !== allowedOrigin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const { message } = req.body;

    // ✅ Validate input
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid input" });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: "Message too long" });
    }

    // 🔒 Rate limiting (10 requests per minute per IP)
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 10;

    if (!rateLimit.has(ip)) {
      rateLimit.set(ip, []);
    }

    const timestamps = rateLimit
      .get(ip)
      .filter((t) => now - t < windowMs);

    timestamps.push(now);
    rateLimit.set(ip, timestamps);

    if (timestamps.length > maxRequests) {
      return res.status(429).json({ error: "Too many requests" });
    }

    // 🔒 Block sensitive data
    const sensitivePatterns =
      /(\b\d{7,}\b)|phone|email|address|ssn|credit card|bank|medical|diagnosis|treatment|@/i;

    if (sensitivePatterns.test(message)) {
      return res.json({
        reply:
          "For privacy and safety, please use our Smart Assessment form so we can assist you properly.",
      });
    }

    // 🤖 Initialize AI
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // 🤖 Generate response
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nUser: ${message}`,
            },
          ],
        },
      ],
    });

    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to help. Could you rephrase that?";

    res.status(200).json({ reply: text });
  } catch (error) {
    console.error(error);

    // 🔒 Hide real error
    res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
}