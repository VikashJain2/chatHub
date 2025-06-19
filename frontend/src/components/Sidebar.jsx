import { useEffect, useRef } from "react";
import { ArrowRightOnRectangleIcon, PlusIcon, UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  users,
  selectedUser,
  setSelectedUser,
  setShowProfileModal,
  setShowInviteModal,
  setShowLogoutModal,
}) => {
  const sidebarRef = useRef(null);

  useEffect(()=>{
    console.log("user friends--->",users)
  },[])
  return (
    <div
      ref={sidebarRef}
      className={`h-full fixed md:static z-30 transform transition-all duration-300 ease-in-out ${
        isSidebarOpen
          ? "translate-x-0 w-64 lg:w-72 opacity-100"
          : "-translate-x-full w-0 opacity-0 overflow-hidden"
      } md:translate-x-0 md:w-64 md:opacity-100 lg:w-72 bg-white shadow-lg`}
    >
      <div className="h-full">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              ChatApp
            </h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-blue-100 font-medium">Conversations</p>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowProfileModal(true);
                  setIsSidebarOpen(false);
                }}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Edit profile"
              >
                <UserCircleIcon className="w-5 h-5 text-blue-100" />
              </button>
              <button
                onClick={() => {
                  setShowInviteModal(true);
                  setIsSidebarOpen(false);
                }}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Invite user"
              >
                <PlusIcon className="w-5 h-5 text-blue-100" />
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(true);
                  setIsSidebarOpen(false);
                }}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Log out"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 text-blue-100" />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-8rem)]">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                setSelectedUser(user);
                setIsSidebarOpen(false);
              }}
              className={`group flex items-center p-4 cursor-pointer transition-all duration-200 ${
                selectedUser?.id === user.id
                  ? "bg-blue-50 border-l-4 border-blue-600"
                  : "hover:bg-gray-50 border-l-4 border-transparent"
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user.avatar}
                  alt={user.userName}
                  className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-white transition-transform group-hover:scale-105"
                />
              </div>
              <div className="ml-4 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate text-base">
                  {user.userName}
                </h2>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
