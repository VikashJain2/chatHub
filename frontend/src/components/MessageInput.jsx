import { FaceSmileIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';



const MessageInput = ({
  newMessage,
  setNewMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  handleSendMessage,
  handleEmojiClick,
}) => {
  return (
    <div className="p-4 border-t border-gray-200 bg-white shadow-lg relative">
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 z-10 animate-fade-in-up">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            emojiStyle={EmojiStyle.NATIVE}
            theme="light"
            skinTonesDisabled
            searchDisabled
            previewConfig={{ showPreview: false }}
            width={350}
            height={400}
          />
        </div>
      )}
      <div className="flex items-center space-x-3 max-w-3xl mx-auto">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-blue-600"
        >
          <FaceSmileIcon className="w-6 h-6" />
        </button>
        <label className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-blue-600 cursor-pointer">
          <PaperClipIcon className="w-6 h-6" />
          <input type="file" className="hidden" />
        </label>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400 text-sm sm:text-base"
        />
        <button
          onClick={handleSendMessage}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center space-x-2 shadow-sm hover:shadow-md"
        >
          <span className="hidden sm:inline text-sm">Send</span>
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessageInput;