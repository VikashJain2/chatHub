import express from 'express'
import verifyToken from '../middleware/auth.middleware.js'
import { fetchAllNotifications } from '../controllers/notification.controller.js'

const notificationRouter = express.Router()

notificationRouter.get("/get",verifyToken, fetchAllNotifications)

export default notificationRouter