import db from "../config/db.js";
import { redisClient } from "../config/redis.js";
import { getDBConnection } from "../helpers/getDBConnection.js";
import { releaseConnection } from "../helpers/releaseConnection.js";
const createNotification = async (
  id,
  connection,
  type,
  inviterId,
  inviteeId,
  invitationId,
  timestamp
) => {
  try {
    
    const [notificationResult] = await connection.query(
      "INSERT INTO notifications (id,type,user_id,related_user_id,invitation_id,timestamp) VALUES(?,?,?,?,?,?)",
      [id, type, inviterId, inviteeId, invitationId, timestamp]
    );

    return notificationResult;
  } catch (error) {
    throw new Error(error);
  }
};

const fetchAllNotifications = async (req, res) => {
  let connection;
  try {
    connection = await getDBConnection();
    const userId = req.user.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User Id is required" });
    }

    const cacheKey = `notifications:${userId}`;

    // Use lRange instead of get
    const cachedNotifications = await redisClient.lRange(cacheKey, 0, -1);

    if (cachedNotifications.length > 0) {
      const parsedData = cachedNotifications.map(JSON.parse);
      return res.status(200).json({ success: true, data: parsedData });
    }

    // Fetch from DB if not in cache
    const [notifications] = await connection.query(
      `SELECT n.id, n.type, n.user_id, n.related_user_id, n.link, n.timestamp, n.invitation_id,
              CONCAT(u.firstName, ' ', u.lastName) AS userName
       FROM notifications n
       LEFT JOIN user u ON n.user_id = u.id
       WHERE n.related_user_id = ?
       ORDER BY n.timestamp DESC`,
      [userId]
    );

    // Optional: Push DB results into Redis for future caching
    if (notifications.length > 0) {
      await redisClient.del(cacheKey); // Clear existing list
      for (const notification of notifications) {
        await redisClient.lPush(cacheKey, JSON.stringify(notification));
      }
      await redisClient.lTrim(cacheKey, 0, 99);
      await redisClient.expire(cacheKey, 60); // optional TTL
    }

    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || error });
  } finally {
    releaseConnection(connection)
  }
};

const deleteNotification = async (req, res) => {
  let connection;
  try {
    const { userId } = req.user;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (!notificationId) {
      return res
        .status(400)
        .json({ success: false, message: "Notification id is required" });
    }

    connection = await getDBConnection();

    const [result] = await connection.query(
      "DELETE FROM notifications WHERE id = ?",
      [notificationId]
    );

    if (result.affectedRows === 0) {
      // connection.release();
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }


    const redisKey = `notifications:${userId}`;
    const userNotifications = await redisClient.lRange(redisKey, 0, -1);

    const updatedNotifications = userNotifications.filter((notifStr) => {
      const notif = JSON.parse(notifStr);
      return notif.id != notificationId; // loose comparison is OK
    });

    if (updatedNotifications.length !== userNotifications.length) {
      await redisClient.del(redisKey);
      if (updatedNotifications.length > 0) {
        await redisClient.rPush(redisKey, ...updatedNotifications); // Use spread
      }
      await redisClient.expire(redisKey, 180);
      await redisClient.lTrim(redisKey, 0, 99);
    }

    return res
      .status(200)
      .json({ success: true, message: "Notification deleted" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  } finally {
    releaseConnection(connection)
  }
};

export { createNotification, fetchAllNotifications, deleteNotification };
