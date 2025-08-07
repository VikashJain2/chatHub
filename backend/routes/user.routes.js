import express from 'express'
import { createUser, fetchFriends, fetchUserDetails, getAllUsersList, getUsersPublicKeyAndPrivateKey, loginUser, logoutUser, updateProfile, uploadAvatar } from '../controllers/user.controller.js'
import verifyToken from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.js'

const userRouter = express.Router()

userRouter.post("/create", createUser)
userRouter.post("/login", loginUser)
userRouter.get("/logout", verifyToken, logoutUser)
userRouter.put("/upload-avatar", verifyToken, upload.single("avatar"), uploadAvatar)
userRouter.get("/get-all",verifyToken, getAllUsersList)
userRouter.put("/update-profile", verifyToken, updateProfile)
userRouter.get("/get-details", verifyToken, fetchUserDetails)
userRouter.get("/friends", verifyToken, fetchFriends)
userRouter.get("/get-public-private-keys", verifyToken, getUsersPublicKeyAndPrivateKey)
export default userRouter