import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

import { Pinecone } from "@pinecone-database/pinecone";




// // text-embedding-004
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// const index = pinecone.index(
//   process.env.PINECONE_INDEX
// );

// async function getEmbedding(text) {
//   const result = await embeddingModel.embedContent(text);
//   return result.embedding.values;
// }

// export const ingestKnowledgeBase = async (req, res) => {
//   try {
//     const text = fs.readFileSync(
//       "./public/sample.txt",
//       "utf8"
//     );

//     const splitter = new RecursiveCharacterTextSplitter({
//       chunkSize: 800,
//       chunkOverlap: 150,
//     });

//     const chunks = await splitter.splitText(text);

//     const vectors = [];

//     for (let i = 0; i < chunks.length; i++) {
//       console.log(`Embedding chunk ${i + 1}`);

//       const embedding = await getEmbedding(chunks[i]);



//       vectors.push({
//         id: `chunk-${i}`,
//         values: embedding,
//         metadata: {
//           text: chunks[i],
//           source: "sample.txt",
//           chunkNumber: i,
//         },
//       });
//     }
//     // console.log(vectors,"lkl")
//     const batchSize = 100;

//     for (let i = 0; i < vectors.length; i += batchSize) {
//       const batch = vectors.slice(i, i + batchSize);

//       await index.upsert({
//         records: batch,
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       totalChunks: chunks.length,
//       message:
//         "Knowledge base uploaded successfully",
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };







// import BM25 from "wink-bm25-text-search";
// import winkNLPUtils from "wink-nlp-utils";





// // =======================
// // LOAD CHUNKS ONCE
// // =======================
// const text = fs.readFileSync(
//   "./public/sample.txt",
//   "utf8"
// );
// const splitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 800,
//   chunkOverlap: 150,
// });
// const chunks = await splitter.splitText(text);

// const documents = chunks.map((chunk, index) => ({
//   id: `chunk-${index}`,
//   text: chunk,
// }));
// // =======================
// // BM25 SETUP
// // =======================

// const bm25 = BM25();

// bm25.defineConfig({
//   fldWeights: {
//     text: 1,
//   },
// });

// bm25.definePrepTasks([
//   winkNLPUtils.string.lowerCase,
//   winkNLPUtils.string.tokenize0,
//   winkNLPUtils.tokens.removeWords,
// ]);

// // NO defineDocConfig()

// documents.forEach((doc, index) => {
//   bm25.addDoc(
//     {
//       text: doc.text,
//     },
//     index
//   );
// });

// bm25.consolidate();




// //   return response.embeddings[0].values;
// // }

// function extractNumbers(text) {
//   return text.match(/\d+/g) || [];
// }

// // =======================
// // CHATBOT
// // =======================




// =======================
// HELPERS
// =======================
const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-2-preview",
});
async function getEmbedding2(text) {
  const result = await embeddingModel.embedContent(text);
  //  console.log(result)
  return result.embedding.values;
}


// Simple in-memory chat store (for demo; use DB in production)
const chatMemory = {};

// =======================
// GREETINGS
// =======================

const greetings = [
  // Basic Greetings
  "hi",
  "hii",
  "hiii",
  "hello",
  "hey",
  "hey there",
  "hola",
  "yo",
  "sup",
  "what's up",
  "whats up",
  "good day",

  // Time-based Greetings
  "good morning",
  "good afternoon",
  "good evening",
  "good night",

  // Polite Greetings
  "greetings",
  "welcome",
  "nice to meet you",
  "pleasure to meet you",

  // Gratitude
  "thanks",
  "thank you",
  "thankyou",
  "thanks a lot",
  "many thanks",
  "thx",
  "ty",

  // Farewells
  "bye",
  "goodbye",
  "see you",
  "see you later",
  "take care",
  "have a nice day",
  "have a great day",
  "catch you later",
  "cya",
];

const index = pinecone.index(
  process.env.PINECONE_INDEX
);



import BM25 from "wink-bm25-text-search";
import winkNLPUtils from "wink-nlp-utils";



// =======================
// BM25 SETUP
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

function levenshtein(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // replace
          matrix[i][j - 1] + 1,     // insert
          matrix[i - 1][j] + 1      // delete
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export const chatbot = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: "Missing message or userId" });
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
      return res.status(200).json({
        success: false,
        answer: "Question not allowed.",
      });
    }

    // =======================
    // GREETINGS
    // =======================



const isGreeting = greetings.some((greeting) => {
   
  const distance = levenshtein(lower, greeting);

  return distance <= 2;
});
if (isGreeting) {
      return res.status(200).json({
        success: true,
        answer:
          "Hello! 👋 I'm NGO Guru CRM Assistant. How can I help you today?",
      });
    }


    const chatHistory = chatMemory[userId] || [];


    // =======================
    // EMBEDDING SEARCH
    // =======================
    const queryText =
      message;
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

    // console.log(pineconeResults, vectorResults, "oo")


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
    // TAKE TOP 2 FROM EACH
    // =======================

    const topVectorResults = vectorResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    const topBm25Results = bm25Results
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);


    // =======================
    // MERGE UNIQUE RESULTS
    // =======================

    const uniqueMap = new Map();

    [
      ...topVectorResults,
      ...topBm25Results
    ].forEach((item) => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });


    const topChunks = [...uniqueMap.values()];
    const context = topChunks
      .map((chunk) => chunk.text)
      .join("\n\n");
    const bestVectorScore =
      topVectorResults[0]?.score || 0;

    if (bestVectorScore < 0.4 && topChunks.length === 0) {
      return res.status(200).json({
        success: true,
        answer:
          "I could not find that information in the company knowledge base."
      });
    }

    // =======================
    // CONFIDENCE CHECK
    // =======================



    const systemInstruction = `
You are NGO Guru CRM Assistant.

Rules:
1. Answer ONLY using the provided context.
2. Do not use outside knowledge.
3. Do not guess.
4. Do not invent facts.
5. Reply in maximum 21 words only.
6. If information is missing reply exactly:
"I could not find that information in the company knowledge base."

Context:
${context}
`;

    const messages = [
      ...chatHistory.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }]
      })),
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];


    // console.log(bm25Results, pineconeResults, "score")

    // const model = genAI.getGenerativeModel({
    //   model: "gemini-3-flash-preview"
    // });
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction
    });


    const result = await model.generateContent({
      contents: messages
    });
    // const result = await model.generateContent({
    //   contents: messages
    // });


    const reply = result.response.text();

    // Save memory (limit to last 5 exchanges)
    chatMemory[userId] = [
      ...chatHistory.slice(-4),
      { role: "user", text: message },
      { role: "assistant", text: reply }
    ];

    // res.json({ reply });
    res.status(200).json({
      success: true,
      answer: reply,
    })

  } catch (error) {
    console.error("Assistant error:", error);
    res.status(500).json({ error });
  }
};

