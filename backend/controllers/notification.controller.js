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

    // Use lRange instead of get
    const cachedNotifications = await redisClient.lRange(cacheKey, 0, -1);

    if (cachedNotifications.length > 0) {
      const parsedData = cachedNotifications.map(JSON.parse);
      connection.release();
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

    return res
      .status(200)
      .json({ success: true, data: notifications });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: error.message || error });
  } finally {
    if (connection) connection.release();
  }
};


export { createNotification, fetchAllNotifications };
