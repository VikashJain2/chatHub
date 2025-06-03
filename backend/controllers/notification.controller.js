import db from "../config/db.js";
import { redisClient } from "../config/redis.js";
const createNotification = async (type, inviterId, inviteeId, invitationId) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [notificationResult] = await connection.query(
      "INSERT INTO notifications (type,user_id,related_user_id,invitation_id) VALUES(?,?,?,?)",
      [type, inviterId, inviteeId, invitationId]
    );

    return notificationResult;
  } catch (error) {
    throw new Error(error);
  } finally {
    if (connection) connection.release();
  }
};

const fetchAllNotifications = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const userId = req.user.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User Id is required" });
    }

    const cacheKey = `notifications:${userId}`;

    const existInCache = await redisClient.get(cacheKey);

    if (existInCache) {
      const parsedData = JSON.parse(existInCache);
      connection.release();
      return res.status(200).json({ success: true, notifications: parsedData });
    }

    const [notifications] = await connection.query(
      "SELECT n.id,n.type,n.user_id,n.related_user_id,n.link,n.timestamp, CONCAT(u.firstName, ' ', u.lastName) AS userName FROM notifications n LEFT JOIN user u ON n.user_id = u.id WHERE n.related_user_id = ? ORDER BY n.timestamp DESC",
      [userId]
    );

    await redisClient.setEx(cacheKey, JSON.stringify(notifications), {
      EX: 60,
    });

    return res
      .status(200)
      .json({ success: true, notifications: notifications });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || error });
  } finally {
    if (connection) connection.release();
  }
};

export { createNotification, fetchAllNotifications };
