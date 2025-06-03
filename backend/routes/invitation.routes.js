import express from 'express'
import verifyToken from '../middleware/auth.middleware.js';
import { createInvitation } from '../controllers/invitation.controller.js';
import { fetchAllNotifications } from '../controllers/notification.controller.js';
const invitationRouter = express.Router();


invitationRouter.post("/create/:inviteeId",verifyToken, createInvitation)
invitationRouter.get("/get/:userId", fetchAllNotifications)
export default invitationRouter