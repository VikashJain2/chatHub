import db from "../config/db.js";
import { redisClient } from "../config/redis.js";
import { getDBConnection } from "../helpers/getDBConnection.js";
import { releaseConnection } from "../helpers/releaseConnection.js";
import { createNotification } from "./notification.controller.js";
import { parse, v4 as uuidv4 } from "uuid";
const createInvitation = async (req, res) => {
  let connection;
  try {
    const io = req.app.get("io");
    connection = await getDBConnection();
    const { inviteeId } = req.params;

    const inviterId = req.user.userId;

    if (!inviteeId || !inviterId) {
      return res
        .status(400)
        .json({ success: false, message: "Invitee Or Inviter Id is required" });
    }

    const [existingUser] = await connection.query(
      "SELECT id FROM user WHERE id = ? ",
      [inviteeId]
    );

    if (existingUser.length === 0) {
      // connection.release();
      return res
        .status(400)
        .json({ success: false, message: "Invitee User Not Found" });
    }

    const [existingInvitation] = await connection.query(
      "SELECT id FROM invitations WHERE inviter_id=? AND invitee_id=? AND status=?",
      [inviterId, inviteeId, "pending"]
    );

    if (existingInvitation.length > 0) {
      // connection.release();
      return res.status(400).json({
        success: false,
        message: "Invitation Already Exist And Pending",
      });
    }
    let id = uuidv4();

    const [inviteResult] = await connection.query(
      "INSERT INTO invitations (id,inviter_id,invitee_id) VALUES(?,?, ?)",
      [id, inviterId, inviteeId]
    );

    const [userName] = await connection.query(
      "SELECT CONCAT(firstName, ' ', lastName) AS userName FROM user WHERE id=?",
      [inviterId]
    );

    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    const notificationId = uuidv4();
    const notificationResult = await createNotification(
      notificationId,
      connection,
      "invitation_sent",
      inviterId,
      inviteeId,
      id,
      timestamp
    );

    const notification = {
      id: notificationId,
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
    await redisClient.expire(`notifications:${inviteeId}`, 180);
    io.to(`user:${inviteeId}`).emit("invite-notification", notification);

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
  } finally {
    releaseConnection(connection)
  }
};

const acceptInvitation = async (req, res) => {
  let connection;
  try {
    const io = req.app.get("io");
    const { userId } = req.user;
    const { invitation_id } = req.params;
    if (!userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not Authenticated" });
    }

    connection = await getDBConnection();
    await connection.beginTransaction();

    const [invitations] = await connection.query(
      "SELECT * FROM invitations WHERE id = ? AND invitee_id = ? AND status = 'pending' FOR UPDATE",
      [invitation_id, userId]
    );

    if (invitations.length === 0) {
      // connection.release();
      return res.status(404).json({
        success: false,
        message: "Invitation Not Found Or Already Processed",
      });
    }

    const invitation = invitations[0];
    const inviterId = invitation.inviter_id;

    const [existingFriends] = await connection.query(
      `SELECT 1 FROM user_friends 
       WHERE (user_id = ? AND friend_id = ?)
          OR (user_id = ? AND friend_id = ?)
       LIMIT 1 FOR UPDATE`,
      [inviterId, userId, userId, inviterId]
    );

    if (existingFriends.length > 0) {
      await connection.rollback();
      // connection.release();
      return res.status(400).json({
        success: false,
        message: "You are already friends with this user",
      });
    }
    await connection.query(
      "UPDATE invitations SET status='accepted' WHERE id = ?",
      [invitation_id]
    );

    await connection.query(
      "DELETE FROM notifications WHERE invitation_id = ? AND type = 'invitation_sent'",
      [invitation_id]
    );

    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

    await connection.query(
      "INSERT INTO user_friends (user_id, friend_id) VALUES (?, ?), (?, ?)",
      [inviterId, userId, userId, inviterId]
    );

    let notificationId = uuidv4();
    const notificationResult = await createNotification(
      notificationId,
      connection,
      "invitation_accepted",
      userId,
      inviterId,
      invitation_id,
      timestamp
    );

    const [accepter] = await connection.query(
      "SELECT CONCAT(firstName, ' ', lastName) AS userName FROM user WHERE id = ?",
      [userId]
    );

    const notification = {
      id: notificationId,
      type: "invitation_accepted",
      user_id: userId,
      related_user_id: inviterId,
      invitation_id: invitation_id,
      timestamp: timestamp,
      userName: accepter[0].userName,
    };

    await connection.commit();

    try {
      const inviterCacheKey = `user:friends:${inviterId}`
      const updateCache = await redisClient.get(inviterCacheKey)

     const parsedFriends = updateCache ? JSON.parse(updateCache) : [];

      const [newFriendRow] = await connection.query("SELECT id AS friendId, CONCAT(firstName,' ',lastName) AS userName,email, avatar FROM user WHERE id = ?", [userId])

      if(newFriendRow.length > 0){
        const newFriend = newFriendRow[0];
        parsedFriends.push(newFriend);

    await redisClient.setEx(inviterCacheKey, 300, JSON.stringify(parsedFriends));
      }

      const inviteeCacheKey = `user:friends:${userId}`
      const updateInviteeCache = await redisClient.get(inviteeCacheKey);

     const parsedInviteeFriends = updateInviteeCache ? JSON.parse(updateInviteeCache) : [];

      const [inviter] = await connection.query("SELECT id AS friendId, CONCAT(firstName,' ',lastName) AS userName,email, avatar FROM user WHERE id = ?", [inviterId])

       if(inviter.length > 0){
        const newFriend = inviter[0];
        parsedInviteeFriends.push(newFriend);

    await redisClient.setEx(inviteeCacheKey, 300, JSON.stringify(parsedInviteeFriends));
       }

      const inviteeKey = `notifications:${userId}`;
      const inviteeNotifications = await redisClient.lRange(inviteeKey, 0, -1);

      const updatedInviteeNotifications = inviteeNotifications.filter(
        (notifStr) => {
          const notif = JSON.parse(notifStr);
          return !(
            notif.type === "invitation_sent" &&
            notif.invitation_id === invitation_id
          );
        }
      );

      if (updatedInviteeNotifications.length !== inviteeNotifications.length) {
        await redisClient.del(inviteeKey);

        if (updatedInviteeNotifications.length > 0) {
          await redisClient.rPush(inviteeKey, ...updatedInviteeNotifications);
        }
      }

      const inviterKey = `notifications:${inviterId}`;

      await redisClient.lPush(inviterKey, JSON.stringify(notification));
      await redisClient.expire(inviteeKey, 180);
      await redisClient.lTrim(inviterKey, 0, 99);

      io.to(`user:${inviterId}`).emit("invite-accepted", notification);
    } catch (redisError) {
      console.error("Redis operation failed:", redisError);
    }

    return res
      .status(200)
      .json({ success: true, message: "Invitation Accepted SuccessFully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed To Accept Invitation",
    });
  } finally {
    releaseConnection(connection)
  }
};

export { createInvitation, acceptInvitation };
