import db from "../config/db.js"
import { v4 as uuidv4 } from "uuid";
const createChat = async(req,res)=>{
    let connection;
    console.log("req.body", req.body)
    try {
        const io = req.app.get('io');
        const {sender_id, receiver_id, message, iv, room_id} = req.body;

        if(!sender_id || !receiver_id || !message || !iv){
            return res.status(400).json({success: false, message: "All fields are required"})
        }

        const id = uuidv4()

        connection = await db.getConnection()

        const [result] = await connection.query("INSERT INTO messages (id,sender_id, receiver_id, message, iv, room_id) VALUES (?,?,?,?,?,?)", [id,sender_id, receiver_id, message, iv, room_id])

        // const messageId = result.insertId;

        // console.log("messageId--->", messageId)

        const [insertedMessage] = await connection.query("SELECT * from messages WHERE id = ?", [id]);

        console.log("insertedMessage-->", insertedMessage)

        io.to(room_id).emit("message-inserted", insertedMessage[0])
        connection.release()

        return res.status(200).json({success: true, message: "Message inserted successfully", insertedMessageInDB: insertedMessage[0]})


    } catch (error) {
        return res.status(500).json({success: false, message: error.message || "Internal Server Error"})
    }finally{
        if(connection) connection.release()
    }
}

export {
    createChat
}