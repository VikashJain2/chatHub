import express from 'express'
import { createUser, getAllUsersList, loginUser, logoutUser, uploadAvatar } from '../controllers/user.controller.js'
import verifyToken from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.js'

const userRouter = express.Router()

userRouter.post("/create", createUser)
userRouter.post("/login", loginUser)
userRouter.get("/logout", verifyToken, logoutUser)
userRouter.put("/upload-avatar", verifyToken, upload.single("avatar"), uploadAvatar)
userRouter.get("/get-all",verifyToken, getAllUsersList)
export default userRouter