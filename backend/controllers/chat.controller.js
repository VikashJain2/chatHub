import db from "../config/db.js"

const createChat = async(req,res)=>{
    let connection;
    try {
        const io = req.app.get('io');
        const {sender_id, receiver_id, message, iv, room_id} = req.body;

        if(!sender_id || !receiver_id || !message || !iv){
            return res.status(400).json({success: false, message: "All fields are required"})
        }

        connection = await db.getConnection()

        const [result] = await connection.query("INSERT INTO messages (sender_id, receiver_id, message, iv, room_id) VALUES (?,?,?,?,?)", [sender_id, receiver_id, message, iv, room_id])

        const messageId = result.insertId;

        const [insertedMessage] = await connection.query("SELECT * from messages WHERE id = ?", [messageId]);

        io.to(room_id).emit("message-inserted", insertedMessage[0])
        connection.release()

        return res.status(200).json({success: true, message: "Message inserted successfully"})


    } catch (error) {
        return res.status(500).json({success: false, message: error.message || "Internal Server Error"})
    }finally{
        if(connection) connection.release()
    }
}

export {
    createChat
}