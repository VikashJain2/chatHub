import express from 'express'
import cors from "cors"
import "dotenv/config"
import cookieParser from "cookie-parser"
import userRouter from './routes/user.routes.js'
import invitationRouter from './routes/invitation.routes.js'
import http from 'http'
import { initSocketServer } from './socket/socketServer.js'
import notificationRouter from './routes/notification.routes.js'
import chatRouter from './routes/chat.routes.js'
import geminiRouter from './routes/gemini.routes.js'
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: [process.env.FRONTEND_URL,"http://192.168.1.50:5173"],
    credentials: true
}))


app.use("/api/v1/user", userRouter)
app.use("/api/v1/invitation", invitationRouter)
app.use("/api/v1/notifications", notificationRouter)
app.use("/api/v1/chat", chatRouter)
app.use("/api/v1/ai", geminiRouter)
const PORT = process.env.PORT || 4001
const server = http.createServer(app)

const io = initSocketServer(server)

app.set("io",io)

server.listen(PORT, ()=>{
    console.log(`App listing on http://localhost:${PORT}`)
})