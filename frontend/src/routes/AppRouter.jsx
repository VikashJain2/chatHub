import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthForm from "../components/AuthForm";
import App from "../App";
import {Toaster} from 'react-hot-toast'
import ChatApp from '../pages/Chat';
const routes  = [
    {
        path: "/",
        element: <App/>
    },
    {
        path: "/login",
        element: <AuthForm isLogin={true}/>
    },
    {
        path: "/register",
        element: <AuthForm isLogin={false}/>
    },
    {
        path: "/chat/:userId",
        element: <ChatApp/>
    }
]

const router = createBrowserRouter(routes)

export default function AppRouter(){
    return <>
      <Toaster position='bottom-right'/>
    <RouterProvider router={router}/>
    </>

}