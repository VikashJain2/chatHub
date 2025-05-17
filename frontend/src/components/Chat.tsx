import { useState, useRef, useEffect } from 'react';
import { UsersIcon, VideoCameraIcon, PhoneIcon, PaperClipIcon, FaceSmileIcon, Bars3Icon, XMarkIcon, PlusIcon, LinkIcon, EnvelopeIcon, BellIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
}

interface User {
  id: number;
  name: string;
  email: string; // Added email field
  avatar: string;
  online: boolean;
}

interface Notification {
  id: number;
  type: 'sent' | 'received' | 'accepted';
  userName: string;
  timestamp: string;
  link?: string;
}

const ChatApp = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Hello there! 👋', sender: 'other', timestamp: '09:41' },
    { id: 2, text: 'Hi! How are you?', sender: 'user', timestamp: '09:42' },
    { id: 3, text: 'Ready for our meeting today? 🚀', sender: 'other', timestamp: '09:45' },
  ]);
  // fadsfdasafdsasfdasfdasdfasfddsfas
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [invitationSent, setInvitationSent] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('You');
  const [profileEmail, setProfileEmail] = useState('you@example.com'); // Added email state
  const [profileAvatar, setProfileAvatar] = useState('https://i.pravatar.cc/150?img=0');
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, type: 'received', userName: 'Alice Brown', timestamp: 'Yesterday, 14:30', link: 'https://chatapp.pro/invite/alice123' },
    { id: 2, type: 'sent', userName: 'Bob Wilson', timestamp: 'Today, 09:15', link: 'https://chatapp.pro/invite/bob456' },
    { id: 3, type: 'accepted', userName: 'Charlie Davis', timestamp: 'Today, 10:00' },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<User[]>([
    { id: 0, name: 'You', email: 'you@example.com', avatar: 'https://i.pravatar.cc/150?img=0', online: true },
    { id: 1, name: 'John Doe', email: 'john@example.com', avatar: 'https://i.pravatar.cc/150?img=1', online: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: 'https://i.pravatar.cc/150?img=2', online: false },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', avatar: 'https://i.pravatar.cc/150?img=3', online: true },
  ]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isSidebarOpen && window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        text: newMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleEmojiClick = (emojiObject: any) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSendInvitation = (user: User) => {
    setInvitationSent(true);
    setInviteInput(user.name);
    const newNotification: Notification = {
      id: notifications.length + 1,
      type: 'sent',
      userName: user.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      link: `https://chatapp.pro/invite/${btoa(user.name)}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setNotifications([...notifications, newNotification]);
    setTimeout(() => {
      setShowInviteModal(false);
      setInviteInput('');
      setInvitationSent(false);
    }, 2000);
  };

  const generateInvitationLink = () => {
    const mockLink = `https://chatapp.pro/invite/${btoa(inviteInput)}-${Math.random().toString(36).substr(2, 9)}`;
    setInvitationLink(mockLink);
    const newNotification: Notification = {
      id: notifications.length + 1,
      type: 'sent',
      userName: inviteInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      link: mockLink,
    };
    setNotifications([...notifications, newNotification]);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAcceptInvitation = (notification: Notification) => {
    const newUser: User = {
      id: users.length + 1,
      name: notification.userName,
      email: `${notification.userName.toLowerCase().replace(' ', '')}@example.com`, // Generate dummy email
      avatar: `https://i.pravatar.cc/150?img=${users.length + 1}`,
      online: false,
    };
    setUsers([...users, newUser]);
    const acceptedNotification: Notification = {
      id: notifications.length + 1,
      type: 'accepted',
      userName: notification.userName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications([...notifications.filter((n) => n.id !== notification.id), acceptedNotification]);
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
  };

  const handleUpdateProfile = () => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === 0 ? { ...user, name: profileName, email: profileEmail, avatar: profileAvatar } : user
      )
    );
    setShowProfileModal(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
   
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileAvatar(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredUsers = inviteInput.trim()
    ? users.filter((user) => user.name.toLowerCase().includes(inviteInput.toLowerCase()))
    : [];

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl transform transition-all animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Invite a Friend</h3>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInvitationLink('');
                  setInviteInput('');
                  setInvitationSent(false);
                  setIsSidebarOpen(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="space-y-6">
              <input
                type="text"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                placeholder="Search user or enter email"
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-gray-50 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                disabled={invitationSent}
              />
              {invitationSent ? (
                <div className="bg-green-50 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                  <EnvelopeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Invitation sent to {inviteInput}!</span>
                </div>
              ) : invitationLink ? (
                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600">Invitation Link</span>
                  </div>
                  <div className="flex gap-3">
                    <input
                      value={invitationLink}
                      readOnly
                      className="flex-1 text-xs sm:text-sm p-3 bg-white border border-gray-200 rounded-xl truncate text-gray-700"
                    />
                    <button
                      onClick={() => copyToClipboard(invitationLink)}
                      className="px-4 py-2 sm:px-5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-md hover:shadow-blue-200"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-2xl p-3 bg-white">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white"
                            />
                            <span className="text-sm font-medium text-gray-800">{user.name}</span>
                          </div>
                          <button
                            onClick={() => handleSendInvitation(user)}
                            className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-medium transition-all"
                          >
                            Invite
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : inviteInput.trim() ? (
                    <button
                      onClick={generateInvitationLink}
                      className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-medium transition-all shadow-md hover:shadow-blue-200"
                    >
                      Generate Invitation Link
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl transform transition-all animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Your Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <img
                  src={profileAvatar}
                  alt={profileName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-white"
                />
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900">{profileName}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{profileEmail}</p>
                  <p className="text-xs sm:text-sm text-green-500 font-medium">Online</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-3 sm:p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-gray-50 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full p-3 sm:p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-gray-50 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                  <input
                    type="text"
                    value={profileAvatar}
                    onChange={(e) => setProfileAvatar(e.target.value)}
                    placeholder="Enter avatar URL"
                    className="w-full p-3 sm:p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-gray-50 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Profile Picture</label>
                  <label className="w-full p-3 sm:p-4 border border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all">
                    <PaperClipIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-600">Choose Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <button
                  onClick={handleUpdateProfile}
                  className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-medium transition-all shadow-md hover:shadow-blue-200"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        ref={sidebarRef}
        className={`h-full fixed md:static z-30 transform transition-all duration-300 ease-in-out 
          ${isSidebarOpen ? 'translate-x-0 w-64 sm:w-72 opacity-100' : '-translate-x-full w-0 opacity-0 overflow-hidden'} 
          md:translate-x-0 md:w-64 md:opacity-100 lg:w-72 bg-white shadow-xl`}
      >
        <div className="h-full">
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-br from-blue-600 to-indigo-600">
            <div className="flex justify-between items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">ChatApp</h1>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-blue-100 font-medium">Conversations</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setIsSidebarOpen(false);
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title="Edit profile"
                >
                  <UserCircleIcon className="w-5 h-5 text-blue-100" />
                </button>
                <button
                  onClick={() => {
                    setShowInviteModal(true);
                    setIsSidebarOpen(false);
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title="Invite user"
                >
                  <PlusIcon className="w-5 h-5 text-blue-100" />
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)]">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  setIsSidebarOpen(false);
                }}
                className={`group flex items-center p-4 cursor-pointer transition-all duration-200 ${
                  selectedUser?.id === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-sm ring-2 ring-white transition-transform group-hover:scale-105"
                  />
                  {user.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{user.name}</h2>
                  <p className={`text-xs sm:text-sm ${user.online ? 'text-green-500' : 'text-gray-500'} font-medium`}>
                    {user.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="w-6 h-6 text-gray-600" />
            </button>
            {selectedUser ? (
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="relative">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-sm ring-2 ring-white"
                  />
                  {selectedUser.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">{selectedUser.name}</h2>
                  <p className={`text-xs sm:text-sm ${selectedUser.online ? 'text-green-500' : 'text-gray-500'} font-medium`}>
                    {selectedUser.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ) : (
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Select a conversation</h2>
            )}
          </div>
          <div className="flex space-x-2 sm:space-x-3 relative" ref={notificationRef}>
            {selectedUser && (
              <>
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-blue-600">
                  <VideoCameraIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-blue-600">
                  <PhoneIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-blue-600 relative"
            >
              <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-500 rounded-full text-[10px] sm:text-xs text-white flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="md:absolute md:top-12 md:right-0 fixed inset-0 md:inset-auto md:w-96 bg-white md:border md:border-gray-200 rounded-2xl md:shadow-2xl z-50 md:max-h-96 md:overflow-y-auto animate-fade-in-up flex flex-col">
                <div className="p-4 sm:p-5 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Notifications</h3>
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
                        className="p-4 sm:p-5 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          <span className="text-xs sm:text-sm font-medium text-gray-800">
                            {notification.type === 'sent' && `Sent invitation to ${notification.userName}`}
                            {notification.type === 'received' && `Received invitation from ${notification.userName}`}
                            {notification.type === 'accepted' && `${notification.userName} accepted your invitation`}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-3">{notification.timestamp}</p>
                        <div className="flex gap-2 items-center flex-wrap">
                          {notification.type === 'received' && (
                            <button
                              onClick={() => handleAcceptInvitation(notification)}
                              className="px-3 py-1 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-medium transition-all"
                            >
                              Accept
                            </button>
                          )}
                          {notification.link && (
                            <>
                              <input
                                value={notification.link}
                                readOnly
                                className="flex-1 text-[10px] sm:text-xs p-2 bg-gray-100 border border-gray-200 rounded-xl truncate text-gray-700"
                              />
                              <button
                                onClick={() => copyToClipboard(notification.link!)}
                                className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-all"
                              >
                                Copy
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 sm:p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors"
                          >
                            <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 sm:p-5 text-center text-gray-500 text-xs sm:text-sm">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedUser ? (
          <>
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
              <div className="max-w-full sm:max-w-3xl mx-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'other' && (
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover mt-1"
                      />
                    )}
                    <div
                      className={`relative max-w-[70%] sm:max-w-lg px-4 py-2 sm:py-3 rounded-2xl shadow-sm transition-all duration-200 animate-slide-in ${
                        message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm sm:text-base">{message.text}</p>
                      <p
                        className={`text-[10px] sm:text-xs mt-1 ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <img
                        src={users[0].avatar}
                        alt="You"
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover mt-1"
                      />
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-white shadow-lg relative">
              {showEmojiPicker && (
                <div className="absolute bottom-16 sm:bottom-20 right-2 sm:right-4 z-10 animate-fade-in-up">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    emojiStyle={EmojiStyle.NATIVE}
                    theme="light"
                    skinTonesDisabled
                    searchDisabled
                    previewConfig={{ showPreview: false }}
                    width={300}
                    height={350}
                    className="sm:w-[350px] sm:h-[400px]"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2 sm:space-x-3 max-w-full sm:max-w-3xl mx-auto">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-blue-600"
                >
                  <FaceSmileIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <label className="p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-blue-600 cursor-pointer">
                  <PaperClipIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <input type="file" className="hidden" />
                </label>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 p-2 sm:p-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-gray-50 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-3 py-2 sm:px-5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-all flex items-center space-x-1 sm:space-x-2 shadow-md hover:shadow-blue-200"
                >
                  <span className="hidden sm:inline text-xs sm:text-sm">Send</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
            <div className="text-center text-gray-600 max-w-md px-4">
              <div className="relative mb-6 sm:mb-8 mx-auto w-40 h-40 sm:w-48 sm:h-48 bg-blue-100/30 rounded-full flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-200/30 to-indigo-200/30 animate-pulse"></div>
                <UsersIcon className="w-20 h-20 sm:w-24 sm:h-24 text-blue-400 animate-float" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Welcome to ChatApp</h2>
              <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
                Start a conversation by selecting a contact or inviting a new friend to join.
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes scale-in {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-in {
          0% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
          background: #93c5fd;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #60a5fa;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        @media (max-width: 767px) {
          .sidebar-hidden {
            width: 0 !important;
            overflow: hidden !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatApp;