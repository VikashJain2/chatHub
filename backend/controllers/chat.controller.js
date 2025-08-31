import { v4 as uuidv4 } from "uuid";
import { getDBConnection } from "../helpers/getDBConnection.js";
import { releaseConnection } from "../helpers/releaseConnection.js";
const createChat = async (req, res) => {
  let connection;
  try {
    const io = req.app.get("io");
    const { sender_id, receiver_id, message, iv, room_id } = req.body;

    if (!sender_id || !receiver_id || !message || !iv) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const id = uuidv4();

    connection = await getDBConnection();

    const [result] = await connection.query(
      "INSERT INTO messages (id,sender_id, receiver_id, message, iv, room_id) VALUES (?,?,?,?,?,?)",
      [id, sender_id, receiver_id, message, iv, room_id]
    );

    const [insertedMessage] = await connection.query(
      "SELECT * from messages WHERE id = ?",
      [id]
    );

    io.to(room_id).emit("message-inserted", insertedMessage[0]);

    return res.status(200).json({
      success: true,
      message: "Message inserted successfully",
      insertedMessageInDB: insertedMessage[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  } finally {
    releaseConnection(connection);
  }
};

const getMessages = async (req, res) => {
  let connection;
  try {
    const { room_id, page = 1, limit = 20 } = req.query;
    if (!room_id) {
      return res
        .status(400)
        .json({ success: false, message: "room_id is required" });
    }
    connection = await getDBConnection();
    const offset = (page - 1) * limit;
    const [messages] = await connection.query(
      "SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?",
      [room_id, parseInt(limit), parseInt(offset)]
    );

    const [totalCount] = await connection.query(
      "SELECT COUNT(*) as total FROM messages WHERE room_id = ?",
      [room_id]
    );

    return res.status(200).json({
      success: true,
      messages: messages.reverse(),
      hasMore: offset + messages.length < totalCount[0].total,
      total: totalCount[0].total,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Internal Server Error",
      });
  } finally {
    releaseConnection(connection);
  }
};

export { createChat, getMessages };
