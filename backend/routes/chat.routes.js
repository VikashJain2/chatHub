import express from 'express'
import verifyToken from '../middleware/auth.middleware.js'
import { createChat } from '../controllers/chat.controller.js'

const chatRouter = express.Router()


chatRouter.post("/create", verifyToken, createChat)

export default chatRouter;