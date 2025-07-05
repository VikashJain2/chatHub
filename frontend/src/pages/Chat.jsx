import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import InviteModal from "../components/InviteModal";
import ProfileModal from "../components/ProfileModal";
import LogoutModal from "../components/LogoutModal";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import WelcomeScreen from "../components/WelcomeScreen";
import { useSocket } from "../socket/socket";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../store/userSlice";
import toast from "react-hot-toast";

const ChatApp = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [invitationSent, setInvitationSent] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUser] = useState([]);

  const messagesContainerRef = useRef(null);
  const notificationRef = useRef(null);
  const sidebarRef = useRef(null);
  const searchTimeout = useRef(null);
  let BASE_URL = import.meta.env.VITE_BASE_URL;

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (!socket) {
      return;
    }
    const handleNewNotification = (data) => {
      setNotifications((prev) => [data, ...prev]);
    };
    socket.on("invite-notification", handleNewNotification);
    socket.on("invite-accepted", handleNewNotification);
    socket.on("message-inserted",(data)=>{
      console.log("Data of message--->",data)
      // setMessages(prevMessages => [...prevMessages, data])
      setMessages((prevMessages)=> {
        const existMessages = prevMessages.some((msg)=> msg.id === data.id)
        if(!existMessages){
         return [...prevMessages, data]
        }else{
          return prevMessages
        }
      })
    })
    return () => {
      socket.off("invite-notification", handleNewNotification);
    };

  }, [socket]);

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
    setUserDetails(user);
    fetchAllNotifications();
    fetchUserFriends();
  }, [user]);


  useEffect(()=>{
    if(!socket && !selectedUser) return;
    socket.emit("join-room",selectedUser.friendId,user.id)

    socket.on("room-joined", (data)=>{
      dispatch(updateUser({roomId: data}))
    })
  },[selectedUser])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isSidebarOpen &&
        window.innerWidth < 768
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const fetchUserFriends = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user/friends`, {
        withCredentials: true,
      });
      if (response.data.success) {
        console.log("Fetched user friends:", response.data.data);
        setUsers(response.data.friends);
      } else {
        console.error("Failed to fetch user friends:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching user friends:", error);
    }
  };
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    console.log("Notification Id", notificationId)
    try {
      const response = await axios.delete(
        `${BASE_URL}/notifications/delete/${notificationId}`,{withCredentials: true}
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setNotifications((prevNotifications) =>
          prevNotifications.filter(
            (notification) => notification.id !== notificationId
          )
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log("Error deleting notification:", error);
      if (error.response) {
        toast.error(error.response.data.message);
      }
    }
  }, []);

  const handleAcceptInvitation = async (invitationId, notificationId) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/invitation/accept/${invitationId}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setNotifications((prevNotifications) => [
          ...prevNotifications.filter((n) => n.id !== notificationId),
        ]);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    }

    // setUsers((prevUsers) => [...prevUsers, newUser]);
    // const acceptedNotification = {
    //   id: notifications.length + 1,
    //   type: "invitation_sent",
    //   firstName: notification.firstName,
    //   lastName: notification.lastName,
    //   timestamp: new Date().toLocaleTimeString([], {
    //     hour: "2-digit",
    //     minute: "2-digit",
    //   }),
    // };
    // setNotifications((prevNotifications) => [
    //   ...prevNotifications.filter((n) => n.id !== notification.id),
    //   acceptedNotification,
    // ]);
  };

  const handleEmojiClick = useCallback((emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  }, []);

  const handleSendMessage = useCallback(async() => {
    if (newMessage.trim()) {
      // const message = {
      //   id: messages.length + 1,
      //   text: newMessage,
      //   sender: "user",
      //   timestamp: new Date().toLocaleTimeString([], {
      //     hour: "2-digit",
      //     minute: "2-digit",
      //   }),
      // };

      let message = {
        sender_id: user.id,
        receiver_id: selectedUser.friendId,
        message: newMessage,
        room_id: user.roomId,
        iv: "text123"
      }

      try {
        const response = await axios.post(`${BASE_URL}/chat/create`,message, {
          withCredentials: true
        })

        if(response.data.success){
       setMessages((prevMessages) => [...prevMessages, response.data.insertedMessageInDB]);
       setNewMessage("");
        }
      } catch (error) {
        if(error && error.response){
          toast.error(error.response.data.message)
        }else{
          toast.error("Something went wrong")
        }
      }
    
    }
  }, [newMessage, messages]);

  const handleSendInvitation = useCallback(async (user) => {
    setInviteInput(user.firstName + user.lastName);
    try {
      const response = await axios.post(
        `http://localhost:4000/api/v1/invitation/create/${user.id}`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        setInvitationSent(true);
        toast.success(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something Went Wrong. Try Again Letter!");
      }
    }
  }, []);

  const generateInvitationLink = useCallback(() => {
    const mockLink = `https://chatapp.pro/invite/${btoa(
      inviteInput
    )}-${Math.random().toString(36).substr(2, 9)}`;
    setInvitationLink(mockLink);
  }, [inviteInput]);

  const fetchAllNotifications = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/notifications/get`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something Went Wrong. Try Again Letter!");
      }
    }
  }, []);

  const handleSearchUser = useCallback((e) => {
    const value = e.target.value;
    setInviteInput(value);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      (async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/user/get-all?search=${encodeURIComponent(value)}`,
            { withCredentials: true }
          );
          if (response.data.success) {
            setFilteredUser(response.data.data);
          } else {
            console.log(response.data.message);
          }
        } catch (error) {
          if (error.response) {
            toast.error(error.response.data.message);
          } else {
            toast.error("Something Went Wrong. Try Again Letter!");
          }
        }
      })();
    }, 500);
  }, []);

  const handleUpdateProfile =async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}/user/update-profile`,
        {userDetails},
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(updateUser(response.data.user));
        setShowProfileModal(false);
      }
    } catch (error) {
      console.log("Error updating profile:", error);
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something Went Wrong. Try Again Letter!");
      }
    }
  }

  const handleImageUpload = useCallback(async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) {
      alert("Please Select A file");
      return;
    }

    let formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await axios.put(
        `${BASE_URL}/user/upload-avatar`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(updateUser({ avatar: response.data.avatarUrl.secure_url }));
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something Went Wrong. Try Again Letter!");
      }
      console.log(error);
    }
  }, []);

  const handleLogout = useCallback(() => {
    console.log("User logged out");
    setShowLogoutModal(false);
    setSelectedUser(null);
    setIsSidebarOpen(false);
  }, []);

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
        <ProfileModal
          showProfileModal={showProfileModal}
          setShowProfileModal={setShowProfileModal}
          userDetails={userDetails}
          setUserDetails={setUserDetails}
          handleUpdateProfile={handleUpdateProfile}
          handleImageUpload={handleImageUpload}
        />
      )}

      {showLogoutModal && (
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
