import { useSelector } from "react-redux"
import { useEffect, useRef } from "react"
import { io } from "socket.io-client";
const useSocket = ()=>{
  const userId = useSelector((state)=> state.user.id)
  const socketRef = useRef(null)

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