import { useRef, useEffect } from 'react';



const MessageList= ({ messages, selectedUser, users }) => {
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

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

   useEffect(()=>{
    console.log("inside messagelist-->",selectedUser, users)
  })
 
  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 bg-gray-100">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'other' && selectedUser && (
              <img
                src={selectedUser.avatar}
                alt={selectedUser.firstName}
                className="w-10 h-10 rounded-full object-cover mt-2 shadow-sm"
              />
            )}
            <div
              className={`relative max-w-[70%] sm:max-w-md px-4 py-3 rounded-xl shadow-md transition-all duration-300 animate-slide-in ${
                message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <p className="text-sm sm:text-base leading-relaxed">{message.text}</p>
              <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                {message.timestamp}
              </p>
            </div>
            {message.sender === 'user' && (
              <img
                src={users[0].avatar}
                alt="You"
                className="w-10 h-10 rounded-full object-cover mt-2 shadow-sm"
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;