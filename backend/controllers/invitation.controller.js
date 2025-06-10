import db from "../config/db.js";
import { redisClient } from "../config/redis.js";
import { createNotification } from "./notification.controller.js";
import {v4 as uuidv4} from 'uuid'
const createInvitation = async (req, res) => {
  let connection;
  try {
    const io  = req.app.get("io")
    connection = await db.getConnection();
    const { inviteeId } = req.params;

    const inviterId = req.user.userId;

    if (!inviteeId || !inviterId) {
      return res
        .status(400)
        .json({ success: false, message: "Invitee Or Inviter Id is required" });
    }

    console.log(inviteeId);
    const [existingUser] = await connection.query(
      "SELECT id FROM user WHERE id = ? ",
      [inviteeId]
    );

    if (existingUser.length === 0) {
      connection.release();
      return res
        .status(400)
        .json({ success: false, message: "Invitee User Not Found" });
    }

    const [existingInvitation] = await connection.query(
      "SELECT id FROM invitations WHERE inviter_id=? AND invitee_id=? AND status=?",
      [inviterId, inviteeId, "pending"]
    );

    if (existingInvitation.length > 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: "Invitation Already Exist And Pending",
      });
    }
    let id = uuidv4()

    const [inviteResult] = await connection.query(
      "INSERT INTO invitations (id,inviter_id,invitee_id) VALUES(?,?, ?)",
      [id,inviterId, inviteeId]
    );

    const [userName] = await connection.query(
      "SELECT CONCAT(firstName, ' ', lastName) AS userName FROM user WHERE id=?",
      [inviterId]
    );

    const notificationResult = await createNotification(
      "invitation_sent",
      inviterId,
      inviteeId,
      id
    );

    const notification = {
      id: notificationResult.insertId,
      type: "invitation_sent",
      user_id: inviterId,
      related_user_id: inviteeId,
      invitation_id: id,
      timestamp: new Date().toISOString(),
      userName: userName[0].userName,
    };
    await redisClient.lPush(
      `notifications:${inviteeId}`,
      JSON.stringify(notification)
    );
    await redisClient.lTrim(`notifications:${inviteeId}`, 0, 99);

    console.log("invitation to--->",`user:${inviteeId}`)
    console.log("Rooms:", io.sockets.adapter.rooms);
    io.to(`user:${inviteeId}`).emit('invite-notification', notification)
    
    return res.status(200).json({
      success: true,
      message: "Invitation sent SuccessFully",
      notificationResult,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: error.message || error });
  } finally{
    if(connection) connection.release()
  }
};

export { createInvitation };
