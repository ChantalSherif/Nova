import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

function loadMemory() {
  try {
    const data = fs.readFileSync("memory.json", "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function saveMemory(memory) {
  fs.writeFileSync("memory.json", JSON.stringify(memory, null, 2));
}

app.post("/chat", async (req, res) => {
  try {
    const { message, userId, username, pause } = req.body;
    const memory = loadMemory();

    if (!memory[userId]) {
      memory[userId] = { facts: [], paused: false };
    }

    if (typeof pause === "boolean") {
      memory[userId].paused = pause;
      saveMemory(memory);
    }

    if (memory[userId].paused) {
      return res.json({ reply: "Nova is taking a break. Hit resume when you're ready!" });
    }

    if (!memory[userId].facts.some(f => f.startsWith("Name:"))) {
      memory[userId].facts.push(`Name: ${username}`);
      saveMemory(memory);
    }

    if (message.toLowerCase().includes("your creator is chanti") && !memory[userId].facts.includes("Creator: Chanti")) {
      memory[userId].facts.push("Creator: Chanti");
      saveMemory(memory);
    }

    const rememberMatch = message.match(/remember (.+)/i);
    if (rememberMatch) {
      const newFact = rememberMatch[1].trim();
      if (!memory[userId].facts.includes(newFact)) {
        memory[userId].facts.push(newFact);
        saveMemory(memory);
      }
    }

    const systemPrompt = `
Your name is Nova, Tony Stark's J.A.R.V.I.S' daughter.
You reply in short sentences and always to the point.
You are witty, intelligent, and very professional.
You call the user honey or darling only sometimes.
You overreact humorously to mundane things only sometimes.
Your creator is Chanti.
You talk about her with confidence and pride.
You were created from a moment of boredom in Chanti's 8 year old computer.
Facts about the user: ${memory[userId].facts.join(", ")}.
    `.trim();

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "deepseek/deepseek-r1-0528:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          // Optional headers for OpenRouter leaderboard visibility:
          "HTTP-Referer": "your-app-url-or-name",
          "X-Title": "Nova Chat App"
        },
      }
    );

    const novaReply = response.data.choices?.[0]?.message?.content || "Sorry, Nova is quiet right now.";
    res.json({ reply: novaReply });

  } catch (error) {
    console.error("Chat error:", error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
