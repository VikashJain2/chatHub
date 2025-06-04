import { useSelector } from "react-redux"
import type { RootState } from "../store/store"
import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client";
const useSocket = ()=>{
  const userId = useSelector((state:RootState)=> state.user.id)
  const socketRef = useRef<Socket | null>(null)

  useEffect(()=>{
    if(userId){
      socketRef.current = io(import.meta.env.VITE_REACT_APP_BACKEND_URL,{
        auth:{
          userId
        },
        withCredentials: true
      })
    }
    return ()=> {
      socketRef?.current?.disconnect()
    }
  },[userId])
  return socketRef.current
}

export {
  useSocket
}