import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Initialize OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // put your API key in .env
});

// POST /api/genai/chat
router.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error in /api/genai/chat:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
