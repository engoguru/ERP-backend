import express from "express";
import { chatbot, ingestKnowledgeBase } from "../controllers/chat.controller.js";

const chatRoute=express.Router()


chatRoute.post("/start",chatbot)

// router.post("/ingest", ingestKnowledgeBase);
// chatRoute.post("/ingest",ingestKnowledgeBase)


export default chatRoute