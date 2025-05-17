import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import AuthForm from "../components/AuthForm";
import App from "../App";
import type { JSX } from "react";
import ChatApp from '../components/Chat';

const routes : RouteObject[] = [
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
        path: "/chat",
        element: <ChatApp/>
    }
]

const router = createBrowserRouter(routes)

export default function AppRouter() : JSX.Element{
    return <RouterProvider router={router}/>
}