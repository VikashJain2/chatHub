import { io, Socket } from 'socket.io-client';

const BACKEND_URL: string = import.meta.env.VITE_REACT_APP_BACKEND_URL as string;

const socket: Socket = io(BACKEND_URL, {
  // auth: {
  //   // userId: string
  // },
  withCredentials: true,
});

export default socket;
