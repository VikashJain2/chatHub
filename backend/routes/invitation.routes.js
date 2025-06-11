import express from 'express'
import verifyToken from '../middleware/auth.middleware.js';
import { acceptInvitation, createInvitation } from '../controllers/invitation.controller.js';
import { fetchAllNotifications } from '../controllers/notification.controller.js';
const invitationRouter = express.Router();


invitationRouter.post("/create/:inviteeId",verifyToken, createInvitation)
invitationRouter.get("/get/:userId", fetchAllNotifications)
invitationRouter.patch("/accept/:invitation_id", verifyToken, acceptInvitation)
export default invitationRouter