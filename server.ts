import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("leads.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    email TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  console.log("Server: Checking GEMINI_API_KEY...");
  if (process.env.GEMINI_API_KEY) {
    console.log("Server: GEMINI_API_KEY is configured.");
  } else {
    console.warn("Server: GEMINI_API_KEY is NOT configured. Chat will not work.");
  }

  // API Routes
 // =========================
// API ROUTES
// =========================

// Lead capture
app.post("/api/leads", (req, res) => {
  const { name, phone, email, message } = req.body;

  try {
    const stmt = db.prepare(
      "INSERT INTO leads (name, phone, email, message) VALUES (?, ?, ?, ?)"
    );

    stmt.run(name, phone, email, message);

    console.log(`Auto-response email triggered for ${email}`);

    res.json({ success: true });
  } catch (error) {
    console.error("Lead capture error:", error);
    res.status(500).json({ error: "Failed to save lead" });
  }
});


// Smart assessment
app.post("/api/assessment", (req, res) => {
  const { patientName, contactName, phone, urgency, careType, details } =
    req.body;

  try {
    const message = `SMART ASSESSMENT: Urgency: ${urgency}. Care Type: ${careType}. Details: ${details}. Contact: ${contactName}`;

    const stmt = db.prepare(
      "INSERT INTO leads (name, phone, email, message) VALUES (?, ?, ?, ?)"
    );

    stmt.run(patientName, phone, "assessment@prudent.com", message);

    res.json({
      success: true,
      message: "Assessment submitted successfully",
    });
  } catch (error) {
    console.error("Assessment error:", error);
    res.status(500).json({ error: "Failed to save assessment" });
  }
});


// FAQ API
app.get("/api/faq", (req, res) => {
  const faqs = [
    {
      question: "What areas do you serve?",
      answer:
        "We proudly serve Bismarck, Mandan, and Lincoln, North Dakota.",
    },
    {
      question: "Do you provide 24/7 care?",
      answer:
        "Yes, we offer flexible scheduling including 24/7 care, overnight stays, and hourly assistance tailored to your needs.",
    },
    {
      question: "How do I know if I'm eligible for homecare?",
      answer:
        "Eligibility depends on individual needs. We offer a free home assessment to help determine the best care plan.",
    },
    {
      question: "Are your caregivers trained?",
      answer:
        "Absolutely. Our caregivers are trained professionals who are kind, patient, and dedicated to providing high-quality care.",
    },
  ];

  res.json(faqs);
});


// AI CHAT API
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const systemPrompt = `
You are the AI assistant for Prudent Homecare.

Your job is to help families understand and arrange homecare services.

Business Information:
- Company: Prudent Homecare
- Location: Bismarck, Mandan, and Lincoln, North Dakota
- Services: Personal Care, Companionship, Medication Support, Transportation, Agency Foster Home
- Care options include hourly care, overnight care, and 24/7 care.

Rules:
- Always be warm, calm, and professional.
- Focus only on homecare, caregiving, and services offered.
- If someone asks unrelated questions, gently redirect to care services.
- Encourage users to request a care assessment when appropriate.
- Never make up medical advice.
- Speak clearly and simply.

Goal:
Help families understand care options and guide them toward scheduling an assessment.
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...(history || []),
        { role: "user", parts: [{ text: message }] }
      ]
    });

    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({ reply: text });

  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "Chat failed" });
  }
});
