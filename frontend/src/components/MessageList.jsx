import { useRef, useEffect, useState } from 'react';
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

// Utility function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileMessage = ({ message, isOwnMessage, myDetails }) => {
  const handleDownload = () => {
    window.open(message.file_data.url, '_blank');
  };

  const renderFilePreview = () => {
    switch (message.file_data.type) {
      case 'image':
        return (
          <div className="max-w-xs">
            <img 
              src={message.file_data.url} 
              alt={message.file_data.name}
              className="rounded-lg max-h-48 object-contain cursor-pointer"
              onClick={() => window.open(message.file_data.url, '_blank')}
            />
            <div className={`mt-2 text-sm  ${
                message.sender_id === myDetails.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}>
              {message.file_data.name} ({formatFileSize(message.file_data?.size)})
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="max-w-xs">
            <video controls className="rounded-lg max-h-48">
              <source src={message.file_data.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="mt-2 text-sm text-gray-600">
              {message.file_data.name} ({formatFileSize(message.file_data?.size)})
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="max-w-xs">
            <audio controls className="w-full">
              <source src={message.file_data.url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <div className="mt-2 text-sm text-gray-600">
              {message.file_data.name} ({formatFileSize(message.file_data?.size)})
            </div>
          </div>
        );
      
      default:
        return (
          <div className={`p-3 rounded-lg ${isOwnMessage ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <div className="flex items-center">
              <div className="mr-3 text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-black">{message.file_data.name}</div>
                <div className="text-sm text-gray-600">
                  {formatFileSize(message.file_data?.size)}
                </div>
                <button 
                  onClick={handleDownload}
                  className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderFilePreview();
};

const MessageList = ({ messages, selectedUser, users, loadMore, hasMore, isLoading }) => {
  const [isOnTop, setIsOnTop] = useState(false);
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
    const handleScroll = () => {
      if (messagesContainerRef.current.scrollTop === 0 && hasMore && !isLoading) {
        setIsOnTop(true)
        loadMore();
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [hasMore, isLoading, loadMore]);

  useEffect(() => {
    if(!isOnTop)
    scrollToBottom();
  }, [messages]);


  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 bg-gray-100">
      {isLoading && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
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
              {message.message_type === 'file' ? (
                <FileMessage 
                  message={message} 
                  isOwnMessage={message.sender_id === myDetails.id}
                  myDetails={myDetails}
                />
              ) : (
                <>
                  <p className="text-sm sm:text-base leading-relaxed">{message.message}</p>
                  <p className={`text-xs mt-1 ${message.sender_id === myDetails.id ? 'text-blue-200' : 'text-gray-500'}`}>
                    {formatTimestamp(message.timestamp)}
                  </p>
                </>
              )}
            </div>

            {message.sender_id === myDetails.id && (
              <>
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