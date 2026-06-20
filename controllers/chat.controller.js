import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

import { Pinecone } from "@pinecone-database/pinecone";



const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-2-preview",
});
// text-embedding-004
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index(
  process.env.PINECONE_INDEX
);

async function getEmbedding(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

export const ingestKnowledgeBase = async (req, res) => {
  try {
    const text = fs.readFileSync(
      "./public/sample.txt",
      "utf8"
    );

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 150,
    });

    const chunks = await splitter.splitText(text);

    const vectors = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(`Embedding chunk ${i + 1}`);

      const embedding = await getEmbedding(chunks[i]);



      vectors.push({
        id: `chunk-${i}`,
        values: embedding,
        metadata: {
          text: chunks[i],
          source: "sample.txt",
          chunkNumber: i,
        },
      });
    }
    // console.log(vectors,"lkl")
    const batchSize = 100;

    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);

      await index.upsert({
        records: batch,
      });
    }

    return res.status(200).json({
      success: true,
      totalChunks: chunks.length,
      message:
        "Knowledge base uploaded successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};







import BM25 from "wink-bm25-text-search";
import winkNLPUtils from "wink-nlp-utils";





// =======================
// LOAD CHUNKS ONCE
// =======================
const text = fs.readFileSync(
  "./public/sample.txt",
  "utf8"
);
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 150,
});
const chunks = await splitter.splitText(text);

const documents = chunks.map((chunk, index) => ({
  id: `chunk-${index}`,
  text: chunk,
}));
// =======================
// BM25 SETUP
// =======================

const bm25 = BM25();

bm25.defineConfig({
  fldWeights: {
    text: 1,
  },
});

bm25.definePrepTasks([
  winkNLPUtils.string.lowerCase,
  winkNLPUtils.string.tokenize0,
  winkNLPUtils.tokens.removeWords,
]);

// NO defineDocConfig()

documents.forEach((doc, index) => {
  bm25.addDoc(
    {
      text: doc.text,
    },
    index
  );
});

bm25.consolidate();

// =======================
// HELPERS
// =======================

async function getEmbedding2(text) {
  const result = await embeddingModel.embedContent(text);
  //  console.log(result)
  return result.embedding.values;
}



//   return response.embeddings[0].values;
// }

function extractNumbers(text) {
  return text.match(/\d+/g) || [];
}

// =======================
// CHATBOT
// =======================


export const chatbot = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        answer: "Message is required.",
      });
    }

    const lower = message.toLowerCase().trim();

    // =======================
    // GUARDRAILS
    // =======================

    const blockedTopics = [
      "hack",
      "sql injection",
      "database dump",
      "password",
      "terrorism",
    ];

    if (
      blockedTopics.some((word) =>
        lower.includes(word)
      )
    ) {
      return res.status(400).json({
        success: false,
        answer: "Question not allowed.",
      });
    }

    // =======================
    // GREETINGS
    // =======================

    const greetings = [
      "hi",
      "hii",
      "hello",
      "hey",
      "good morning",
      "good evening",
      "thanks",
      "thank you",
    ];

    if (greetings.includes(lower)) {
      return res.json({
        success: true,
        answer:
          "Hello! I'm NGO Guru CRM Assistant. How can I help you today?",
      });
    }

    // =======================
    // CHAT HISTORY
    // =======================

    global.chatStore = global.chatStore || new Map();

    let chatHistory =
      global.chatStore.get(sessionId) || [];

    chatHistory.push({
      role: "user",
      content: message,
    });

    const history = chatHistory.slice(-6);

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });

    // =======================
    // QUERY REWRITE
    // =======================

    const rewritePrompt = `
You are a query rewriting assistant.

Rewrite the latest user question into a complete standalone question.

Rules:
- Do NOT answer.
- Use conversation history.
- Keep it short and clear.

History:
${history
  .map(
    (h) =>
      `${h.role}: ${h.content}`
  )
  .join("\n")}

Latest Question:
${message}

Return only the rewritten question.
`;

    const rewriteResponse =
      await model.generateContent(
        rewritePrompt
      );

    const rewrittenQuestion =
      rewriteResponse.response
        .text()
        .trim();
        console.log(rewrittenQuestion,"pop")

    const queryText =
      rewrittenQuestion || message;

    // =======================
    // EMBEDDING SEARCH
    // =======================

    const queryEmbedding =
      await getEmbedding2(queryText);

    const pineconeResults =
      await index.query({
        vector: queryEmbedding,
        topK: 10,
        includeMetadata: true,
      });

    const vectorResults =
      pineconeResults.matches.map(
        (match) => ({
          id: match.id,
          text: match.metadata.text,
          score: match.score,
        })
      );

    // =======================
    // BM25 SEARCH
    // =======================

    const bm25Results = bm25
      .search(queryText)
      .slice(0, 10)
      .map((result) => ({
        id: documents[result[0]].id,
        text: documents[result[0]].text,
        score: result[1],
      }));

    // =======================
    // HYBRID MERGE
    // =======================

    const uniqueMap = new Map();

    [...vectorResults, ...bm25Results]
      .forEach((item) => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });

    const uniqueResults = [
      ...uniqueMap.values(),
    ];

    // =======================
    // CONFIDENCE CHECK
    // =======================

    const bestScore =
      pineconeResults.matches?.[0]
        ?.score || 0;

    if (bestScore < 0.4) {
      return res.json({
        success: true,
        answer:
          "I could not find that information in the company knowledge base.",
      });
    }

    // =======================
    // RERANKING
    // =======================

    const rerankPrompt = `
Question:
${queryText}

Select the 5 most relevant chunks.

Return JSON only:

{
  "ids":[]
}

Chunks:
${JSON.stringify(uniqueResults)}
`;

    const rerankResponse =
      await model.generateContent(
        rerankPrompt
      );

    let rerankedIds = [];

    try {
      rerankedIds = JSON.parse(
        rerankResponse.response.text()
      ).ids;
    } catch (err) {
      console.log(
        "Rerank parse failed"
      );
    }

    let topChunks =
      uniqueResults.filter((item) =>
        rerankedIds.includes(item.id)
      );

    if (topChunks.length === 0) {
      topChunks =
        uniqueResults.slice(0, 5);
    }

    // =======================
    // CONTEXT
    // =======================

    const context = topChunks
      .map((chunk) => chunk.text)
      .join("\n\n");

    // =======================
    // ANSWER GENERATION
    // =======================

    const answerPrompt = `
You are NGO Guru CRM Assistant.

Rules:

1. Answer ONLY using the context.
2. Do not use outside knowledge.
3. Do not guess.
4. Do not invent facts.
5. If information is missing reply exactly:

"I could not find that information in the company knowledge base."

Context:
${context}

Question:
${queryText}
`;

    const answerResponse =
      await model.generateContent(
        answerPrompt
      );

    const answer =
      answerResponse.response
        .text()
        .trim();

    // =======================
    // ANSWER VALIDATION
    // =======================

    const validationPrompt = `
Question:
${queryText}

Context:
${context}

Answer:
${answer}

Determine whether the answer is fully supported by the context.

Return JSON only:

{
  "supported": true
}
`;

    const validationResponse =
      await model.generateContent(
        validationPrompt
      );

    let supported = false;

    try {
      supported = JSON.parse(
        validationResponse.response.text()
      ).supported;
    } catch (err) {
      supported = false;
    }

    if (!supported) {
      return res.json({
        success: true,
        answer:
          "I could not find that information in the company knowledge base.",
      });
    }

    // =======================
    // NUMBER VALIDATION
    // =======================

    const normalize = (n) =>
      String(n).replace(/,/g, "");

    const answerNumbers =
      extractNumbers(answer).map(
        normalize
      );

    const contextNumbers =
      extractNumbers(context).map(
        normalize
      );

    const invalidNumber =
      answerNumbers.some(
        (num) =>
          !contextNumbers.includes(num)
      );

    if (invalidNumber) {
      return res.json({
        success: true,
        answer:
          "I could not find that information in the company knowledge base.",
      });
    }

    // =======================
    // SAVE HISTORY
    // =======================

    chatHistory.push({
      role: "assistant",
      content: answer,
    });

    global.chatStore.set(
      sessionId,
      chatHistory.slice(-20)
    );

    // =======================
    // RESPONSE
    // =======================

    return res.status(200).json({
      success: true,
      answer,
      confidence: bestScore,
      sources: topChunks.map(
        (chunk) => chunk.id
      ),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};







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

// export const chatbot = async (req, res) => {
//   try {
//     const { message, userId } = req.body;

//     if (!message || !userId) {
//       return res.status(400).json({ error: "Missing message or userId" });
//     }

//     const chatHistory = chatMemory[userId] || [];

//     const systemInstruction = `
// You are an HR assistant for an ERP system.
// Help users with employee, leave, payroll, and task queries.

// Rules:
// - Reply in 1-2 sentences only
// - No markdown, no bullets, no stars
// - Be polite and actionable
// `;

//     const messages = [
//       {
//         role: "user",
//         parts: [{ text: systemInstruction }]
//       },
//       ...chatHistory.map(m => ({
//         role: m.role === "assistant" ? "model" : "user",
//         parts: [{ text: m.text }]
//       })),
//       {
//         role: "user",
//         parts: [{ text: message }]
//       }
//     ];

//     const model = genAI.getGenerativeModel({
//       model: "gemini-3-flash-preview"
//     });

//     const result = await model.generateContent({
//       contents: messages
//     });

//     const reply = result.response.text();

//     // Save memory (limit to last 5 exchanges)
//     chatMemory[userId] = [
//       ...chatHistory.slice(-4),
//       { role: "user", text: message },
//       { role: "assistant", text: reply }
//     ];

//     res.json({ reply });

//   } catch (error) {
//     console.error("Assistant error:", error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };



// import axios from "axios";

// const sendMessage = async () => {
//   const url = "https://backend.aisensy.com/campaign/t1/api/v2";

//   const data = {
//     apiKey: "YOUR_AISENSY_API_KEY",
//     campaignName: "otp_campaign",
//     destination: "91XXXXXXXXXX",
//     userName: "Your Brand Name",
//     templateParams: ["123456"],
//     source: "website"
//   };

//   const res = await axios.post(url, data);
//   console.log(res.data);
// };

// sendMessage();