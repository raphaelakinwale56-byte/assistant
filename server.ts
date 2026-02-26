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
  app.post("/api/leads", (req, res) => {
    const { name, phone, email, message, type } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO leads (name, phone, email, message) VALUES (?, ?, ?, ?)");
      stmt.run(name, phone, email, message);
      
      // Log for "auto-response" simulation
      console.log(`Auto-response email triggered for ${email}`);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Lead capture error:", error);
      res.status(500).json({ error: "Failed to save lead" });
    }
  });

  app.post("/api/assessment", (req, res) => {
    const { patientName, contactName, phone, urgency, careType, details } = req.body;
    try {
      const message = `SMART ASSESSMENT: Urgency: ${urgency}. Care Type: ${careType}. Details: ${details}. Contact: ${contactName}`;
      const stmt = db.prepare("INSERT INTO leads (name, phone, email, message) VALUES (?, ?, ?, ?)");
      stmt.run(patientName, phone, "assessment@prudent.com", message);
      res.json({ success: true, message: "Assessment submitted successfully" });
    } catch (error) {
      console.error("Assessment error:", error);
      res.status(500).json({ error: "Failed to save assessment" });
    }
  });

  app.get("/api/faq", (req, res) => {
    const faqs = [
      {
        question: "What areas do you serve?",
        answer: "We proudly serve Bismarck, Mandan, and Lincoln, North Dakota."
      },
      {
        question: "Do you provide 24/7 care?",
        answer: "Yes, we offer flexible scheduling including 24/7 care, overnight stays, and hourly assistance tailored to your needs."
      },
      {
        question: "How do I know if I'm eligible for homecare?",
        answer: "Eligibility depends on individual needs. We offer a free home assessment to help determine the best care plan for you or your loved one."
      },
      {
        question: "Are your caregivers trained?",
        answer: "Absolutely. Our caregivers are trained professionals who are kind, patient, and genuinely dedicated to providing high-quality care."
      }
    ];
    res.json(faqs);
  });

  // Serve static widget files
  app.use("/widget", express.static(path.join(__dirname, "public")));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
