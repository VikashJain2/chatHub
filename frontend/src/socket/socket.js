import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const useSocket = () => {
  const userId = useSelector((state) => state.user.id);
  const socketRef = useRef(null);
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    if (userId && !socketRef.current) {
      socketRef.current = io(import.meta.env.VITE_REACT_APP_BACKEND_URL, {
        auth: { userId },
        withCredentials: true,
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current.id);
        socketRef.current.emit("join", userId); // ✅ Important
        setSocketReady(true);
      });
    }

    return () => {
      socketRef?.current?.disconnect();
      socketRef.current = null;
      setSocketReady(false);
    };
  }, [userId]);

  return socketReady ? socketRef.current : null;
};

export { useSocket };
