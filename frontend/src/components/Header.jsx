import { useEffect, useRef, useState } from "react";
import {
  Bars3Icon,
  BellIcon,
  EnvelopeIcon,
  PhoneIcon,
  TrashIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useSocket } from "../socket/socket";
import { useDispatch } from "react-redux";
import { updateUser } from "../store/userSlice";

const Header = ({
  selectedUser,
  setIsSidebarOpen,
  notifications,
  showNotifications,
  setShowNotifications,
  handleAcceptInvitation,
  deleteNotification,
  copyToClipboard,
}) => {
  const notificationRef = useRef(null);
  const socket = useSocket();
  const dispatch = useDispatch();
  const [selectedUserStatus, setSelectedUserStatus] = useState({
    isOnline: false,
    lastSeen: null,
  });
  useEffect(() => {
    if (!socket) {
      return;
    }
    if (selectedUser) {
      console.log("Checking user status for:", selectedUser);
      socket.emit("check-user-status", { friendId: selectedUser.friendId });
      socket.on("user-status-response", ({ friendId, isOnline, lastSeen }) => {
        if (friendId === selectedUser.friendId) {
          // dispatch(updateUser({isOnline, lastSeen}))
          setSelectedUserStatus({ isOnline, lastSeen });
          console.log("User status response:", {
            friendId,
            isOnline,
            lastSeen,
          });

          console.log("Updated selectedUser:", selectedUser);
        }
      });
    }

    return () => {
      socket.off("user-status-response", ({ friendId, isOnline, lastSeen }) => {
        if (friendId === selectedUser.friendId) {
          // dispatch(updateUser({isOnline, lastSeen}))
          setSelectedUserStatus({ isOnline, lastSeen });
          console.log("User status response:", {
            friendId,
            isOnline,
            lastSeen,
          });

          console.log("Updated selectedUser:", selectedUser);
        }
      }); // cleanup
    };
  }, [selectedUser]);

  const formatLastSeen = (date) => {
    if (!date) return "Unknown";

    const lastSeen = new Date(date);
    const now = new Date();

    const isSameDay = lastSeen.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = lastSeen.toDateString() === yesterday.toDateString();

    const daysAgo = Math.floor((now - lastSeen) / (1000 * 60 * 60 * 24));

    if (isSameDay)
      return `Today at ${lastSeen.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    if (isYesterday)
      return `Yesterday at ${lastSeen.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    if (daysAgo < 7) return `${daysAgo} day(s) ago`;

    return lastSeen.toLocaleString();
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        </button>
        {selectedUser ? (
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.userName}
                className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-white"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedUser.userName}
              </h2>

              <p className="text-sm text-gray-500">
                {selectedUserStatus.isOnline
                  ? "Online"
                  : `Last seen: ${formatLastSeen(selectedUserStatus.lastSeen)}`}
              </p>
            </div>
          </div>
        ) : (
          <h2 className="text-lg font-semibold text-gray-900">
            Select a conversation
          </h2>
        )}
      </div>
      <div className="flex space-x-3 relative" ref={notificationRef}>
        {selectedUser && (
          <>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-blue-600">
              <VideoCameraIcon className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-blue-600">
              <PhoneIcon className="w-6 h-6" />
            </button>
          </>
        )}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-blue-600 relative"
        >
          <BellIcon className="w-6 h-6" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </button>
        {showNotifications && (
          <div className="md:absolute md:top-12 md:right-0 fixed inset-0 md:inset-auto md:w-96 bg-white md:border md:border-gray-200 rounded-xl md:shadow-2xl z-50 md:max-h-96 md:overflow-y-auto animate-fade-in-up flex flex-col">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-5 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {/* {notification.type === 'invitation_sent' &&
                          `Sent invitation to ${notification.userName}`} */}
                        {notification.type === "invitation_sent" &&
                          `Received invitation from ${notification.userName}`}
                        {notification.type === "invitation_accepted" &&
                          `${notification.userName} accepted your invitation`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                    <div className="flex gap-2 items-center flex-wrap">
                      {notification.type === "invitation_sent" && (
                        <button
                          onClick={() =>
                            handleAcceptInvitation(
                              notification.invitation_id,
                              notification.id
                            )
                          }
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all"
                        >
                          Accept
                        </button>
                      )}
                      {notification.link && (
                        <>
                          <input
                            value={notification.link}
                            readOnly
                            className="flex-1 text-xs p-2 bg-gray-100 border border-gray-300 rounded-lg truncate text-gray-900"
                          />
                          <button
                            onClick={() => copyToClipboard(notification.link)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
                          >
                            Copy
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-5 text-center text-gray-500 text-sm">
                  No notifications
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
