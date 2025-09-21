import express from "express";
import verifyToken from "../middleware/auth.middleware.js";
import { genAIChat } from "../controllers/gemini.controller.js";
import rateLimiter from "../middleware/rateLimiter.js";
const geminiRouter = express.Router();

geminiRouter.post("/ask", verifyToken,rateLimiter(5,60), genAIChat);

export default geminiRouter;
