import type { EmojiClickData } from "emoji-picker-react";
export interface Message {
  id: number;
  text: string;
  sender: "user" | "other";
  timestamp: string;
}
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  // online: boolean;
}

export interface Notification {
  id: number;
  type: "sent" | "received" | "accepted";
  firstName: string;
  lastName: string;
  timestamp: string;
  email?: string;
  link?: string;
}


export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  users: User[];
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  setShowProfileModal: (show: boolean) => void;
  setShowInviteModal: (show: boolean) => void;
  setShowLogoutModal: (show: boolean) => void;
}


export interface HeaderProps {
  selectedUser: User | null;
  setIsSidebarOpen: (open: boolean) => void;
  notifications: Notification[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  handleAcceptInvitation: (notification: Notification) => void;
  deleteNotification: (id: number) => void;
  copyToClipboard: (text: string) => Promise<void>;
}


export interface MessageListProps {
  messages: Message[];
  selectedUser: User | null;
  users: User[];
}

export interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  handleSendMessage: () => void;
  handleEmojiClick: (emojiObject: EmojiClickDataType) => void;
}

export interface InviteModalProps {
  showInviteModal: boolean;
  setShowInviteModal: (show: boolean) => void;
  inviteInput: string;
  setInviteInput: (input: string) => void;
  invitationLink: string;
  setInvitationLink: (link: string) => void;
  invitationSent: boolean;
  setInvitationSent: (sent: boolean) => void;
  filteredUsers: User[];
  handleSendInvitation: (user: User) => void;
  generateInvitationLink: () => void;
  copyToClipboard: (text: string) => Promise<void>;
  setIsSidebarOpen: (open: boolean) => void;
  handleSearchUser: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export interface ProfileModalProps {
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  // profileName: string;
  // setProfileName: (name: string) => void;
  // profileEmail: string;
  // setProfileEmail: (email: string) => void;
  // profileAvatar: string;
  // setProfileAvatar: (avatar: string) => void;
  userDetails: User;
  setUserDetails: (user: User) => void;
  handleUpdateProfile: () => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface LogoutModalProps {
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
  handleLogout: () => void;
}

export interface NotificationModalProps{
  setShowNotifications: (show: boolean)=> void;
  notifications: Notification[];
  handleAcceptInvitation:(notification: Notification) => void;
   copyToClipboard: (text: string) => Promise<void>;
   deleteNotification: (notificationId: number) => void
}

export type EmojiClickDataType = EmojiClickData