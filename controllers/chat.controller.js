

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// app.post("/chat", async (req, res) => {
//   try {
//     const { message } = req.body;

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const result = await model.generateContent(message);
//     const response = await result.response;
//     const text = response.text();

//     res.json({ reply: text });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// });




// Simple in-memory chat store (for demo; use DB in production)
const chatMemory = {};

export const chatbot = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: "Missing message or userId" });
    }

    const chatHistory = chatMemory[userId] || [];

    const systemInstruction = `
You are an HR assistant for an ERP system.
Help users with employee, leave, payroll, and task queries.

Rules:
- Reply in 1-2 sentences only
- No markdown, no bullets, no stars
- Be polite and actionable
`;

    const messages = [
      {
        role: "user",
        parts: [{ text: systemInstruction }]
      },
      ...chatHistory.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }]
      })),
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    });

    const result = await model.generateContent({
      contents: messages
    });

    const reply = result.response.text();

    // Save memory (limit to last 5 exchanges)
    chatMemory[userId] = [
      ...chatHistory.slice(-4),
      { role: "user", text: message },
      { role: "assistant", text: reply }
    ];

    res.json({ reply });

  } catch (error) {
    console.error("Assistant error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
