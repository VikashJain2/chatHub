import type { User } from "../types/types";
import { createSlice } from "@reduxjs/toolkit";
import type {PayloadAction} from '@reduxjs/toolkit'
const initialState: Partial<User> = {}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers:{
       
        setUser: (_, action:PayloadAction<User>)=>{
            console.log("action.payload",action.payload)
            return action.payload
        },

        updateUser: (state, action:PayloadAction<Partial<User>>)=>{
            return {...state, ...action.payload}
        },

        clearUser: ()=>{
            return {}
        }
    }

})

export const {setUser, updateUser, clearUser} = userSlice.actions
export default userSlice.reducer