import express from 'express'
import cors from "cors"
import "dotenv/config"
import cookieParser from "cookie-parser"
import userRouter from './routes/user.routes.js'
import invitationRouter from './routes/invitation.routes.js'
import http from 'http'
import { initSocketServer } from './socket/socketServer.js'
import notificationRouter from './routes/notification.routes.js'
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))


app.use("/api/v1/user", userRouter)
app.use("/api/v1/invitation", invitationRouter)
app.use("/api/v1/notifications", notificationRouter)
const PORT = process.env.PORT || 4001
const server = http.createServer(app)

const io = initSocketServer(server)

app.set("io",io)

server.listen(PORT, ()=>{
    console.log(`App listing on http://localhost:${PORT}`)
})