import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';

// Utility function to format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  try {
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  } catch (e) {
    return '';
  }
};

const MessageList = ({ messages, selectedUser, users }) => {
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const myDetails = useSelector((state) => state.user);

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


  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 bg-gray-100">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${message.sender_id === myDetails.id ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender_id !== myDetails.id &&
              message.sender_id === selectedUser?.friendId &&
              selectedUser && (
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.userName}
                  className="w-10 h-10 rounded-full object-cover mt-2 shadow-sm"
                />
              )}

            <div
              className={`relative max-w-[70%] sm:max-w-md px-4 py-3 rounded-xl shadow-md transition-all duration-300 animate-slide-in ${
                message.sender_id === myDetails.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <p className="text-sm sm:text-base leading-relaxed">{message.message}</p>
              <p className={`text-xs mt-1 ${message.sender_id === myDetails.id ? 'text-blue-200' : 'text-gray-500'}`}>
                {formatTimestamp(message.timestamp)}
              </p>
            </div>

            {message.sender_id === myDetails.id && (
              <>
                <p>{myDetails.userName}</p>
                <img
                  src={myDetails.avatar}
                  alt="You"
                  className="w-10 h-10 rounded-full object-cover mt-2 shadow-sm"
                />
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
