import express from 'express'
import verifyToken from '../middleware/auth.middleware.js'
import { deleteNotification, fetchAllNotifications } from '../controllers/notification.controller.js'

const notificationRouter = express.Router()

notificationRouter.get("/get",verifyToken, fetchAllNotifications)
notificationRouter.delete("/delete/:notificationId", verifyToken, deleteNotification)
export default notificationRouter