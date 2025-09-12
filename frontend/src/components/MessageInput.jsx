import { FaceSmileIcon, PaperClipIcon, XMarkIcon, PhotoIcon, VideoCameraIcon, DocumentTextIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { useState, useRef, useEffect } from 'react';

const MessageInput = ({
  newMessage,
  setNewMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  handleSendMessage,
  handleEmojiClick,
  handleFileUpload
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('document');
  const [filePreview, setFilePreview] = useState(null);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const fileInputRef = useRef(null);
  const fileMenuRef = useRef(null);

  // File type options with icons and accept attributes
  const fileTypeOptions = [
    {
      type: 'image',
      label: 'Photo & Video',
      icon: PhotoIcon,
      accept: 'image/*,video/*'
    },
    {
      type: 'document',
      label: 'Document',
      icon: DocumentTextIcon,
      accept: '.pdf,.doc,.docx,.txt,.rtf'
    },
    {
      type: 'audio',
      label: 'Audio',
      icon: MusicalNoteIcon,
      accept: 'audio/*'
    }
  ];

  // Handle click outside to close file menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target)) {
        setShowFileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFileMenuClick = (option) => {
    setShowFileMenu(false);
    // Set the file input accept attribute based on selection
    fileInputRef.current.accept = option.accept;
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Determine file type based on MIME type
      if (file.type.startsWith('image/')) {
        setFileType('image');
      } else if (file.type.startsWith('video/')) {
        setFileType('video');
      } else if (file.type.startsWith('audio/')) {
        setFileType('audio');
      } else {
        setFileType('document');
      }
      
      // Generate preview based on file type
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview({ type: 'image', url: e.target.result });
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview({ type: 'video', url: e.target.result });
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('audio/')) {
        setFilePreview({ type: 'audio', url: URL.createObjectURL(file) });
      } else {
        setFilePreview({ type: 'document', url: null });
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
      
      {/* File Selection Menu */}
      {showFileMenu && (
        <div 
          ref={fileMenuRef}
          className="absolute bottom-20 left-4 bg-white p-2 rounded-lg shadow-lg border border-gray-200 z-20"
        >
          {fileTypeOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.type}
                onClick={() => handleFileMenuClick(option)}
                className="flex items-center w-full p-3 text-left hover:bg-gray-100 rounded-md transition-colors"
              >
                <IconComponent className="w-5 h-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
      
      {/* File Preview Modal */}
      {selectedFile && (
        <div className="absolute bottom-full left-0 right-0 bg-white p-4 border border-gray-200 rounded-lg shadow-lg mb-2 z-20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-800">Send {fileType}</h3>
            <button onClick={removeFile} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* File Preview Content */}
          <div className="mb-4">
            {filePreview?.type === 'image' && (
              <div className="flex flex-col items-center">
                <img 
                  src={filePreview.url} 
                  alt="Preview" 
                  className="max-h-64 max-w-full rounded-lg object-contain border border-gray-200"
                />
                <p className="text-sm text-gray-600 mt-2">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            )}
            
            {filePreview?.type === 'video' && (
              <div className="flex flex-col items-center">
                <video 
                  controls 
                  className="max-h-64 max-w-full rounded-lg object-contain border border-gray-200"
                >
                  <source src={filePreview.url} type={selectedFile.type} />
                  Your browser does not support the video tag.
                </video>
                <p className="text-sm text-gray-600 mt-2">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            )}
            
            {filePreview?.type === 'audio' && (
              <div className="flex flex-col items-center">
                <div className="w-full p-4 bg-gray-100 rounded-lg flex items-center justify-center">
                  <audio controls className="w-full">
                    <source src={filePreview.url} type={selectedFile.type} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
                <p className="text-sm text-gray-600 mt-2">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            )}
            
            {filePreview?.type === 'document' && (
              <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                <div className="mr-3 text-blue-600">
                  <DocumentTextIcon className="w-10 h-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Caption Input (optional) */}
          <div className="mb-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Add a caption..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 text-sm"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={removeFile}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleFileUpload(selectedFile, fileType)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-3 max-w-3xl mx-auto">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-blue-600"
        >
          <FaceSmileIcon className="w-6 h-6" />
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-blue-600"
          >
            <PaperClipIcon className="w-6 h-6" />
          </button>
          
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>
        
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
          disabled={!newMessage.trim()}
          className={`px-5 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 shadow-sm hover:shadow-md ${
            newMessage.trim() 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
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