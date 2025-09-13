import { v4 as uuidv4 } from "uuid";
import { getDBConnection } from "../helpers/getDBConnection.js";
import { releaseConnection } from "../helpers/releaseConnection.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import fs from 'fs'
import util from "util";
import path from 'path'
const unlinkAsync = util.promisify(fs.unlink);
const rmdirAsync = util.promisify(fs.rm);
const createChat = async (req, res) => {
  let connection;
  try {
    const io = req.app.get("io");
    const { sender_id, receiver_id, message, iv, room_id, message_type = "text", file_name,file_type } = req.body;

    if (!sender_id || !receiver_id || !message || !iv) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const id = uuidv4();

    connection = await getDBConnection();

    const [result] = await connection.query(
      "INSERT INTO messages (id,sender_id, receiver_id, message, iv, room_id, message_type, file_name, file_type) VALUES (?,?,?,?,?,?,?,?,?)",
      [id, sender_id, receiver_id, message, iv, room_id, message_type, file_name, file_type]
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

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No File Provided" });
    }

    console.log("file =>", req.file);

    let resourceType = "auto";

    if (req.file.mimetype.startsWith("image/")) {
      resourceType = "image";
    } else if (req.file.mimetype.startsWith("video/")) {
      resourceType = "video";
    } else if (req.file.mimetype.startsWith("audio/")) {
      
      resourceType = "video";
    } else {
      resourceType = "raw";
    }
    const fileUrl = await uploadToCloudinary(req.file.path, "chatHub", resourceType, "public");
 try {
      await unlinkAsync(req.file.path);
      const uploadDir = path.dirname(req.file.path);
      await rmdirAsync(uploadDir, { recursive: true });
    } catch (cleanupError) {
      console.warn("File cleanup warning:", cleanupError.message);
    }
    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      fileUrl,
    });
  } catch (error) {
    console.error("Error => ", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
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

export { createChat, getMessages, uploadFile };
