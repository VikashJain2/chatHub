import express from 'express'
import cors from "cors"
import "dotenv/config"
import cookieParser from "cookie-parser"
// import { connectDB } from './config/db.js'
import userRouter from './routes/user.routes.js'
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

const PORT = process.env.PORT || 4001
app.use("/api/v1/user", userRouter)
// connectDB()
app.listen(PORT, ()=>{
    console.log(`App listing on http://localhost:${PORT}`)
})