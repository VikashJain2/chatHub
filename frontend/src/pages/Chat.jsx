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
import {
  decryptMessage,
  deriveSharedSecret,
  encryptMessage,
} from "../utils/cryptoUtils";
import { useNavigate } from "react-router-dom";

const ChatApp = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const socket = useSocket();
  const navigate = useNavigate();
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
  const [sharedSecrets, setSharedSecrets] = useState({});
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isEncryptionReady, setIsEncryptionReady] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [roomId, setRoomId] = useState("");
  const messagesContainerRef = useRef(null);
  const notificationRef = useRef(null);
  const sidebarRef = useRef(null);
  const searchTimeout = useRef(null);
  const currentRoomRef = useRef("");
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
    if (!selectedUser) {
      setIsEncryptionReady(false);
      return;
    }

    setIsEncryptionReady(false);

    if (user?.privateKey) {
      const setupEncryption = async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/user/public-key/${selectedUser.friendId}`,
            { withCredentials: true }
          );

          if (response.data.success) {
            const sharedSecret = await deriveSharedSecret(
              user.privateKey,
              response.data.publicKey
            );

            console.log("Derived Shared Secret--->", sharedSecret);

            setSharedSecrets((prev) => ({
              ...prev,
              [selectedUser.friendId]: sharedSecret,
            }));

            setIsEncryptionReady(true);
          }
        } catch (error) {
          console.log("Error setting up encryption:", error);
          toast.error("Could not establish secure connection");
        }
      };

      setupEncryption();
    }
  }, [selectedUser, user?.privateKey]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    const handleNewNotification = (data) => {
      setNotifications((prev) => [data, ...prev]);
    };

    const handleMessageInserted = async (data) => {
      if (
        !selectedUser ||
        (data.sender_id !== selectedUser.friendId &&
          data.receiver_id !== selectedUser.friendId)
      ) {
        return;
      }
      try {
        const sharedSecret = sharedSecrets[selectedUser.friendId];
        let decryptedText;
        if (data.message_type === "file") {
          decryptedText = await decryptMessage(
            data.message,
            data.iv,
            sharedSecret
          );
        } else {
          decryptedText = await decryptMessage(
            data.message,
            data.iv,
            sharedSecret
          );
        }

        const decryptedMessage = {
          ...data,
          message: decryptedText,

          ...(data.message_type === "file" && {
            file_data: {
              url: decryptedText,
              name: data.file_name,
              type: data.file_type,
              size: data?.file_size,
            },
          }),
        };

        setMessages((prevMessages) => {
          const exists = prevMessages.some((msg) => msg.id === data.id);
          if (exists) return prevMessages;
          return [...prevMessages, decryptedMessage];
        });
      } catch (error) {
        console.error("Failed to decrypt incoming socket message:", error);
      }
    };
    socket.on("invite-notification", handleNewNotification);
    socket.on("invite-accepted", handleNewNotification);
    socket.on("message-inserted", handleMessageInserted);
    return () => {
      socket.off("invite-notification", handleNewNotification);
      socket.off("invite-accepted", handleNewNotification);
      socket.off("message-inserted", handleMessageInserted);
    };
  }, [socket, selectedUser, user, sharedSecrets]);

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

  useEffect(() => {
    if (!socket || !selectedUser || isLoggedOut) return;
    setMessages([]);
    setPage(1);
    setHasMore(true);
    setRoomId("");
    setIsEncryptionReady(false);

    if (currentRoomRef.current) {
      socket.emit("leave-room", currentRoomRef.current);
    }
    socket.emit("join-room", selectedUser.friendId, user.id);

    const handleRoomJoined = (data) => {
      if (selectedUser && data.includes(selectedUser.friendId)) setRoomId(data);
      currentRoomRef.current = data;
      // setIsSelectedUserUpdated((prev) => !prev);
    };

    socket.on("room-joined", handleRoomJoined);

    return () => {
      socket.off("room-joined", handleRoomJoined);
      if (currentRoomRef.current) {
        socket.emit("leave-room", currentRoomRef.current);
      }
    };
  }, [socket, selectedUser, user.id, isLoggedOut]);

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

  useEffect(() => {
    if (selectedUser && roomId && isEncryptionReady) {
      if (roomId.includes(selectedUser.friendId)) {
        setPage(1);
        setHasMore(true);
        fetchMessages(1, false);
      } else {
        console.log("Room Id does not match. Skipping Fetch Function");
      }
    }
  }, [selectedUser, roomId, isEncryptionReady]);

  useEffect(() => {
    setMessages([]);
  }, [selectedUser]);
  const loadMoreMessages = () => {
    if (hasMore && !isLoading) {
      console.log("Calling Load More");
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage, true);
    }
  };
  const fetchMessages = async (pageNum, shouldPrepend = false) => {
    if (!selectedUser || !roomId || isLoading) return;
    if (!roomId.includes(selectedUser.friendId)) {
      console.log("Room Id does not match. aborting fetch");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/chat/messages`, {
        params: {
          room_id: roomId,
          page: pageNum,
          limit: 20,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        const newMessages = response.data.messages;
        const sharedSecret = sharedSecrets[selectedUser.friendId];
        const decryptedMessages = await Promise.all(
          newMessages.map(async (msg) => {
            const decryptedText = await decryptMessage(
              msg.message,
              msg.iv,
              sharedSecret
            );

            if (msg.message_type === "file") {
              return {
                ...msg,
                message: decryptedText,
                file_data: {
                  url: decryptedText,
                  name: msg.file_name,
                  type: msg.file_type,
                  size: msg?.file_size,
                },
              };
            } else {
              return { ...msg, message: decryptedText };
            }
          })
        );

        if (shouldPrepend) {
          setMessages((prev) => [...decryptedMessages, ...prev]);
        } else {
          setMessages(decryptedMessages);
        }

        setHasMore(response.data.hasMore);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = useCallback(
    async (file, fileType) => {
      if (!selectedUser || !isEncryptionReady || !roomId) return;
      setUploadingFile(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await axios.post(
          `${BASE_URL}/chat/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true, // merged inside same config object
          }
        );

        if (uploadResponse.data.success) {
          const fileUrl = uploadResponse.data.fileUrl;
          const sharedSecret = sharedSecrets[selectedUser.friendId];

          const { cipherText, iv } = await encryptMessage(
            fileUrl,
            sharedSecret
          );
          const message = {
            sender_id: user.id,
            receiver_id: selectedUser.friendId,
            message: cipherText,
            iv: iv,
            room_id: roomId,
            message_type: "file",
            file_name: file.name,
            file_type: fileType,
            file_size: file.size,
          };

          const response = await axios.post(
            `${BASE_URL}/chat/create`,
            message,
            {
              withCredentials: true,
            }
          );

          if (response.data.success) {
            const insertedMessage = response.data.insertedMessageInDB;
            const decryptUrl = await decryptMessage(
              insertedMessage.message,
              insertedMessage.iv,
              sharedSecret
            );

            setMessages((prevMessages) => {
              const exists = prevMessages.some(
                (msg) => msg.id === insertedMessage.id
              );
              if (!exists) {
                return [
                  ...prevMessages,
                  {
                    ...insertedMessage,
                    message: decryptUrl,
                    file_data: {
                      url: decryptUrl,
                      name: insertedMessage.file_name,
                      type: insertedMessage.file_type,
                      size: insertedMessage?.file_size,
                    },
                  },
                ];
              }
              return prevMessages;
            });

            setNewMessage("");
            toast.success("File sent successfully");
          }
        }
      } catch (error) {
        console.log("Error while uploading file => ", error);
        toast.error("Error uploading file. Please try again.");
      } finally {
        setUploadingFile(false);
      }
    },
    [selectedUser, sharedSecrets, isEncryptionReady, user, roomId]
  );
  const fetchUserFriends = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user/friends`, {
        withCredentials: true,
      });
      if (response.data.success) {
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
    try {
      const response = await axios.delete(
        `${BASE_URL}/notifications/delete/${notificationId}`,
        { withCredentials: true }
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
  };

  const handleEmojiClick = useCallback((emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedUser || !isEncryptionReady || !roomId)
      return;

    try {
      const sharedSecret = sharedSecrets[selectedUser.friendId];

      const { cipherText, iv } = await encryptMessage(newMessage, sharedSecret);

      const message = {
        sender_id: user.id,
        receiver_id: selectedUser.friendId,
        message: cipherText,
        room_id: roomId,
        iv: iv,
      };

      const response = await axios.post(`${BASE_URL}/chat/create`, message, {
        withCredentials: true,
      });

      if (response.data.success) {
        const insertedMessage = response.data.insertedMessageInDB;
        const decryptedMessage = await decryptMessage(
          insertedMessage.message,
          insertedMessage.iv,
          sharedSecret
        );

        setMessages((prevMessages) => {
          const existMessages = prevMessages.some(
            (msg) => msg.id === insertedMessage.id
          );

          if (!existMessages) {
            return [
              ...prevMessages,
              { ...insertedMessage, message: decryptedMessage },
            ];
          } else {
            return prevMessages;
          }
        });

        setNewMessage("");
      }
    } catch (error) {
      console.error("Send message failed:", error);
      toast.error("Failed to send message");
    }
  }, [
    newMessage,
    selectedUser,
    sharedSecrets,
    isEncryptionReady,
    user,
    roomId,
  ]);

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

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}/user/update-profile`,
        { userDetails },
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
  };

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
    setIsLoggedOut(true);
    dispatch(updateUser({}));
    setShowLogoutModal(false);
    setSelectedUser(null);
    setIsSidebarOpen(false);
    navigate("/login");
    toast.success("Logged Out Successfully");
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
              loadMore={loadMoreMessages}
              hasMore={hasMore}
              isLoading={isLoading}
            />

            <MessageInput
              handleEmojiClick={handleEmojiClick}
              handleSendMessage={handleSendMessage}
              setShowEmojiPicker={setShowEmojiPicker}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              showEmojiPicker={showEmojiPicker}
              handleFileUpload={handleFileUpload}
              isFileUploading= {uploadingFile}
              
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
