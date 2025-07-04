import { Server } from "socket.io";
import db from "../config/db.js";
import { generateRoomId } from "../utils/generateRoomId.js";
let io;

export function initSocketServer(httpServer) {
  let connection;
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  const onlineUsers = new Map();
  io.on("connection", (socket) => {
    const userId = socket.handshake?.auth?.userId;

    if (userId) {
      socket.join(`user:${userId}`);
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);

      io.emit("user-status-response", {
        friendId: userId,
        isOnline: true,
        lastSeen: null,
      });
    } else {
      console.warn(`Socket ${socket.id} connected without auth userId`);
    }
    socket.on("join", (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`Socket ${socket.id} joined room user:${userId}`);
      }
    });

    socket.on("join-room", (user1, user2) => {
      if (user1 && user2) {
        
        const roomId = generateRoomId(user1, user2);
        console.log("roomId--->",roomId);
        socket.join(roomId);

        socket.emit("room-joined", roomId);
      }
    });

    socket.on("check-user-status", async ({ friendId }) => {
      console.log(
        `Checking status for friendId: ${friendId} from socket ${socket.id}`
      );
      if (onlineUsers.has(friendId)) {
        socket.emit("user-status-response", {
          friendId,
          isOnline: true,
        });
      } else {
        connection = await db.getConnection();
        const [row] = await connection.query(
          "SELECT last_seen FROM user WHERE id = ?",
          [friendId]
        );

        connection.release();
        socket.emit("user-status-response", {
          friendId,
          isOnline: false,
          lastSeen: row[0].last_seen || null,
        });
      }
    });

    socket.on("disconnect", async () => {
      if (userId) {
        onlineUsers.delete(userId);

        connection = await db.getConnection();

        await connection.query("UPDATE user SET last_seen = ? WHERE id = ?", [
          new Date(),
          userId,
        ]);

        io.emit("user-status-response", {
          friendId: userId,
          isOnline: false,
          lastSeen: new Date(),
        });
      }
      console.log(`Socket ${socket.id} disconnected`);
    });
  });

  return io;
}
