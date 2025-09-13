import express from 'express'
import verifyToken from '../middleware/auth.middleware.js'
import { createChat, getMessages, uploadFile } from '../controllers/chat.controller.js'
import { upload } from '../middleware/upload.js'

const chatRouter = express.Router()


chatRouter.post("/create", verifyToken, createChat)
chatRouter.get("/messages", verifyToken, getMessages)
chatRouter.post("/upload", verifyToken, upload.single('file'), uploadFile)
export default chatRouter;