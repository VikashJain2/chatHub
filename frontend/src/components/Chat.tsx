import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
// import socket from '../socket/socket.ts'
import type {
  ApiResponse,
  EmojiClickDataType,
  Message,
  Notification,
  User,
} from "../types/types";
import InviteModal from "./InviteModal";
import ProfileModal from "./ProfileModal";
import LogoutModal from "./LogoutModal";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import Sidebar from "./Sidebar";
import Header from "./Header";
import WelcomeScreen from "./WelcomeScreen";
import { useSocket } from "../socket/socket";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const ChatApp: React.FC = () => {
  const user = useSelector((state:RootState)=> state.user)
  const socket = useSocket()
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello there! 👋", sender: "other", timestamp: "09:41" },
    { id: 2, text: "Hi! How are you?", sender: "user", timestamp: "09:42" },
    {
      id: 3,
      text: "Ready for our meeting today? 🚀",
      sender: "other",
      timestamp: "09:45",
    },
  ]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [invitationLink, setInvitationLink] = useState<string>("");
  const [inviteInput, setInviteInput] = useState<string>("");
  const [invitationSent, setInvitationSent] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  // const [profileName, setProfileName] = useState<string>("You");
  // const [profileEmail, setProfileEmail] = useState<string>("you@example.com");
  // const [profileAvatar, setProfileAvatar] = useState<string>(
  //   "https://i.pravatar.cc/150?img=0"
  // );
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    // { id: 1, type: 'received', userName: 'Alice Brown', timestamp: 'Yesterday, 14:30', link: 'https://chatapp.pro/invite/alice123' },
    // { id: 2, type: 'sent', userName: 'Bob Wilson', timestamp: 'Today, 09:15', link: 'https://chatapp.pro/invite/bob456' },
    // { id: 3, type: 'accepted', userName: 'Charlie Davis', timestamp: 'Today, 10:00' },
  ]);
  const [users, setUsers] = useState<User[]>([]);

  const [filteredUsers, setFilteredUser] = useState<User[]>([]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  let BASE_URL: string = import.meta.env.VITE_BASE_URL;
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log(user)
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isSidebarOpen &&
        window.innerWidth < 768
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        text: newMessage,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleEmojiClick = (emojiObject: EmojiClickDataType) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSendInvitation = async(user: User) => {
    
    setInviteInput(user.firstName + user.lastName);
    try{
      const response = await axios.post<ApiResponse<Object>>(`http://localhost:4000/api/v1/invitation/create/${user.id}`,{}, { withCredentials: true })

      if(response.data.success){
        setInvitationSent(true);
        alert(response.data.message)
      }
    }catch(error : any){
      if(error.response){
        alert(error.response.data.message)
      }
      console.log(error)
    }
  };

  const generateInvitationLink = () => {
    const mockLink = `https://chatapp.pro/invite/${btoa(
      inviteInput
    )}-${Math.random().toString(36).substr(2, 9)}`;
    setInvitationLink(mockLink);
    const newNotification: Notification = {
      id: notifications.length + 1,
      type: "sent",
      // userName: inviteInput,
      firstName: inviteInput,
      lastName: inviteInput,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      link: mockLink,
    };
    setNotifications([...notifications, newNotification]);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleAcceptInvitation = (notification: Notification) => {
    const newUser: User = {
      id: users.length + 1,
      firstName: notification.firstName,
      lastName: notification.lastName,
      // email: `${notification.userName.toLowerCase().replace(' ', '')}@example.com`,
      email: notification.email!,
      avatar: `https://i.pravatar.cc/150?img=${users.length + 1}`,
      // online: false,
    };
    setUsers([...users, newUser]);
    const acceptedNotification: Notification = {
      id: notifications.length + 1,
      type: "accepted",
      // userName: notification.userName,
      firstName: notification.firstName,
      lastName: notification.lastName,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setNotifications([
      ...notifications.filter((n) => n.id !== notification.id),
      acceptedNotification,
    ]);
  };

  const deleteNotification = (notificationId: number) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== notificationId)
    );
  };

  const handleUpdateProfile = () => {
    // setUsers((prevUsers) =>
    //   prevUsers.map((user) =>
    //     user.id === 0
    //       ? {
    //           ...user,
    //           name: profileName,
    //           email: profileEmail,
    //           avatar: profileAvatar,
    //         }
    //       : user
    //   )
    // );
    // setShowProfileModal(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // const file = event.target.files?.[0];
    // if (file) {
    //   const reader = new FileReader();
    //   reader.onload = (e) => {
    //     if (e.target?.result) {
    //       setProfileAvatar(e.target.result as string);
    //     }
    //   };
    //   reader.readAsDataURL(file);
    // }
  };

  const handleLogout = () => {
    // Placeholder for logout logic (e.g., clear auth token, redirect)
    console.log("User logged out");
    setShowLogoutModal(false);
    setSelectedUser(null);
    setIsSidebarOpen(false);
  };

  const handleSearchUser = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    try {
      const value = e.target.value;
      console.log("function called");

      setInviteInput(value); // still update the state for UI binding

      const response = await axios.get<ApiResponse<User[]>>(
        `${BASE_URL}/user/get-all?search=${encodeURIComponent(value)}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setFilteredUser(response.data.data!);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const filteredUsers = inviteInput.trim()
  //   ? users.filter((user) => user.firstName + user.lastName.toLowerCase().includes(inviteInput.toLowerCase()))
  //   : [];

  // const filteredUsers = handleSearchUser()

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {showInviteModal && (
        <InviteModal
          showInviteModal={showInviteModal}
          inviteInput={inviteInput}
          setShowInviteModal={setShowInviteModal}
          setInviteInput={setInviteInput}
          invitationLink={invitationLink}
          setInvitationLink={setInvitationLink}
          invitationSent={invitationSent}
          setInvitationSent={setInvitationSent}
          filteredUsers={filteredUsers}
          handleSendInvitation={handleSendInvitation}
          generateInvitationLink={generateInvitationLink}
          copyToClipboard={copyToClipboard}
          setIsSidebarOpen={setIsSidebarOpen}
          handleSearchUser={handleSearchUser}
        />
      )}

      {showProfileModal && (
        // <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        //   <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md shadow-2xl transform transition-all animate-scale-in">
        //     <div className="flex justify-between items-center mb-6">
        //       <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
        //         Your Profile
        //       </h3>
        //       <button
        //         onClick={() => setShowProfileModal(false)}
        //         className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        //       >
        //         <XMarkIcon className="w-6 h-6 text-gray-600" />
        //       </button>
        //     </div>
        //     <div className="space-y-6">
        //       <div className="flex items-center space-x-4">
        //         <img
        //           src={profileAvatar}
        //           alt={profileName}
        //           className="w-20 h-20 rounded-full object-cover ring-2 ring-white shadow-sm"
        //         />
        //         <div>
        //           <h4 className="text-lg font-semibold text-gray-900">
        //             {profileName}
        //           </h4>
        //           <p className="text-sm text-gray-600">{profileEmail}</p>
        //           <p className="text-sm text-teal-500 font-medium">Online</p>
        //         </div>
        //       </div>
        //       <div className="space-y-4">
        //         <div>
        //           <label className="block text-sm font-medium text-gray-700 mb-1">
        //             Name
        //           </label>
        //           <input
        //             type="text"
        //             value={profileName}
        //             onChange={(e) => setProfileName(e.target.value)}
        //             placeholder="Enter your name"
        //             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400 text-sm"
        //           />
        //         </div>
        //         <div>
        //           <label className="block text-sm font-medium text-gray-700 mb-1">
        //             Email
        //           </label>
        //           <input
        //             type="email"
        //             value={profileEmail}
        //             onChange={(e) => setProfileEmail(e.target.value)}
        //             placeholder="Enter your email"
        //             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400 text-sm"
        //           />
        //         </div>
        //         <div>
        //           <label className="block text-sm font-medium text-gray-700 mb-1">
        //             Avatar URL
        //           </label>
        //           <input
        //             type="text"
        //             value={profileAvatar}
        //             onChange={(e) => setProfileAvatar(e.target.value)}
        //             placeholder="Enter avatar URL"
        //             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400 text-sm"
        //           />
        //         </div>
        //         <div>
        //           <label className="block text-sm font-medium text-gray-700 mb-1">
        //             Upload Profile Picture
        //           </label>
        //           <label className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-center bg-white hover:bg-gray-50 cursor-pointer transition-all">
        //             <PaperClipIcon className="w-6 h-6 text-gray-600 mr-2" />
        //             <span className="text-sm text-gray-600">Choose Image</span>
        //             <input
        //               type="file"
        //               accept="image/*"
        //               onChange={handleImageUpload}
        //               className="hidden"
        //             />
        //           </label>
        //         </div>
        //         <button
        //           onClick={handleUpdateProfile}
        //           className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
        //         >
        //           Update Profile
        //         </button>
        //       </div>
        //     </div>
        //   </div>
        // </div>

        <ProfileModal
          showProfileModal={showProfileModal}
          setShowProfileModal={setShowProfileModal}
          userDetails={userDetails!}
          setUserDetails={setUserDetails}
          handleUpdateProfile={handleUpdateProfile}
          handleImageUpload={handleImageUpload}
        />
      )}

      {showLogoutModal && (
        // <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        //   <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md shadow-2xl transform transition-all animate-scale-in">
        //     <div className="flex justify-between items-center mb-6">
        //       <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
        //         Log Out
        //       </h3>
        //       <button
        //         onClick={() => setShowLogoutModal(false)}
        //         className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        //       >
        //         <XMarkIcon className="w-6 h-6 text-gray-600" />
        //       </button>
        //     </div>
        //     <p className="text-sm text-gray-600 mb-6">
        //       Are you sure you want to log out?
        //     </p>
        //     <div className="flex gap-4">
        //       <button
        //         onClick={() => setShowLogoutModal(false)}
        //         className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
        //       >
        //         Cancel
        //       </button>
        //       <button
        //         onClick={handleLogout}
        //         className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
        //       >
        //         Log Out
        //       </button>
        //     </div>
        //   </div>
        // </div>

        <LogoutModal
          handleLogout={handleLogout}
          setShowLogoutModal={setShowLogoutModal}
          showLogoutModal={showLogoutModal}
        />
      )}

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        selectedUser={selectedUser}
        setIsSidebarOpen={setIsSidebarOpen}
        setSelectedUser={setSelectedUser}
        setShowInviteModal={setShowInviteModal}
        setShowLogoutModal={setShowLogoutModal}
        setShowProfileModal={setShowProfileModal}
        users={users}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-100">
        <Header
          copyToClipboard={copyToClipboard}
          deleteNotification={deleteNotification}
          handleAcceptInvitation={handleAcceptInvitation}
          notifications={notifications}
          selectedUser={selectedUser}
          setIsSidebarOpen={setIsSidebarOpen}
          setShowNotifications={setShowNotifications}
          showNotifications={showNotifications}
        />

        {selectedUser ? (
          <>
            <MessageList
              messages={messages}
              selectedUser={selectedUser}
              users={users}
            />

            <MessageInput
              handleEmojiClick={handleEmojiClick}
              handleSendMessage={handleSendMessage}
              setShowEmojiPicker={setShowEmojiPicker}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              showEmojiPicker={showEmojiPicker}
            />
          </>
        ) : (
          <WelcomeScreen />
        )}
      </div>

    </div>
  );
};

export default ChatApp;
