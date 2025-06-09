
import { createSlice } from "@reduxjs/toolkit";
const initialState = {}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers:{
       
        setUser: (_, action)=>{
            return action.payload
        },

        updateUser: (state, action)=>{
            return {...state, ...action.payload}
        },

        clearUser: ()=>{
            return {}
        }
    }

})

export const {setUser, updateUser, clearUser} = userSlice.actions
export default userSlice.reducer