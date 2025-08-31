import express from 'express'
import verifyToken from '../middleware/auth.middleware.js'
import { createChat, getMessages } from '../controllers/chat.controller.js'

const chatRouter = express.Router()


chatRouter.post("/create", verifyToken, createChat)
chatRouter.get("/messages", verifyToken, getMessages)
export default chatRouter;