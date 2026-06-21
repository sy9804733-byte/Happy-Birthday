import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini client lazily to ensure robust startup on cloud servers
  let ai: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is missing from secrets configuration.");
      }
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return ai;
  }

  // API endpoint for secure AI birthday wish generation
  app.post("/api/generate-wish", async (req, res) => {
    try {
      const { name, relation, relationCustom, vibe, keywords } = req.body;
      
      const client = getGeminiClient();

      const calculatedRelation = relation === 'custom' ? relationCustom : relation;
      
      // Fine-tune prompt to write a highly customized message
      const systemInstruction = 
        `You are a thoughtful birthday card message writer and creative poet. ` +
        `Your task is to write a highly tailored, beautiful, and engaging birthday greeting for a handsome, smart young man. ` +
        `He has dark styled hair, a warm and friendly smile, and is styling a sharp charcoal suit with a navy blue tie, often in front of a warm red brick wall backdrop. ` +
        `Write a single birthday message or poem based on the sender's info. ` +
        `Keep it beautiful, celebratory, cohesive, and warm. Support distinct styles based on the requested vibe: ` +
        `- Heartwarming: cozy, deeply appreciative, and sweet. ` +
        `- Poetic: elegant verses, rich rhythm, and rhyme. ` +
        `- Nerd/Coder: tech jokes, coding puns (e.g. loops, commits, main branch, arrays, 10x developer). ` +
        `- Professional: clean, inspirational, career growth oriented, but still warm. ` +
        `- Epic/Heroic: cinematic, grand achievements, larger than life adventure tone. ` +
        `No markdown bold borders or block tags around the letter, just direct formatted lines with line breaks. Keep it under 150 words. Ask the reader to carry their bright smile always.`;

      let prompt = `Write a birthday card message.\n`;
      if (name) prompt += `From (Sender): ${name}\n`;
      if (calculatedRelation) prompt += `Sender's relationship to him: ${calculatedRelation}\n`;
      if (vibe) prompt += `Requested Vibe: ${vibe}\n`;
      if (keywords) prompt += `Keywords, personal details or inside jokes to include: ${keywords}\n`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.85,
        }
      });

      const text = response.text || "Wishing you a truly spectacular birthday filled with success, laughter, and beautiful memories!";
      res.json({ success: true, text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ success: false, error: error?.message || "Failed to generate AI message." });
    }
  });

  // Serve static assets based on environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server startup failure:", err);
});
