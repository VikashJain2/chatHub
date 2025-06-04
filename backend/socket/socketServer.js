import { Server } from "socket.io";

let io;

export function initSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on('connection',(socket)=>{
    const userId = socket.handshake?.auth.userId

    if(userId){
        socket.join(`user:${userId}`)
        console.log(`User ${userId} connected with socket ${socket.id}`)
    }

    socket.on('disconnect', () => {
      console.log(`Socket ${socket.id} disconnected`)
    })
  })
  return io
}


