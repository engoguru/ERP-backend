import express from "express";
import { chatbot } from "../controllers/chat.controller.js";

const chatRoute=express.Router()


chatRoute.post("/start",chatbot)


export default chatRoute