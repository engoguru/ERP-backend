

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

        // Load recent chat memory for this user (last 5 messages)
        const chatHistory = chatMemory[userId] || [];

        // Prepare prompt for AI
        const prompt = `
You are HR assistant for an ERP system. 
Assist the user based on their query and context.

Chat history:
${chatHistory.map(m => `${m.role}: ${m.text}`).join("\n")}

Current user query: ${message}

Rules:
- Give a concise reply (1-2 sentences max)
- Do not use Markdown, stars (*), or bullets
- Make it polite and actionable
`;

        // Call Gemini model
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent(prompt);
        const reply = result.response.text();
        // console.log(result)

        // Save user message + AI reply in chat memory (keep last 5)
        chatMemory[userId] = [
            ...chatHistory.slice(-4),
            { role: "user", text: message },
            { role: "assistant", text: reply }
        ];

        res.json({ reply, chatMemory });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
};

