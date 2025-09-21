import { FaceSmileIcon, PaperClipIcon, XMarkIcon, PhotoIcon, VideoCameraIcon, DocumentTextIcon, MusicalNoteIcon, SparklesIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const MessageInput = ({
  newMessage,
  setNewMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  handleSendMessage,
  handleEmojiClick,
  handleFileUpload,
  isFileUploading
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('document');
  const [filePreview, setFilePreview] = useState(null);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [pdfPages, setPdfPages] = useState([]);
  const [currentPdfPage, setCurrentPdfPage] = useState(1);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [inputRows, setInputRows] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const fileMenuRef = useRef(null);
  const aiAssistantRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

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
      accept: '.pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.ppt,.pptx'
    },
    {
      type: 'audio',
      label: 'Audio',
      icon: MusicalNoteIcon,
      accept: 'audio/*'
    }
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setAiPrompt(prev => prev + " " + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Handle click outside to close file menu and AI assistant
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target)) {
        setShowFileMenu(false);
      }
      if (aiAssistantRef.current && !aiAssistantRef.current.contains(event.target)) {
        setShowAIAssistant(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height based on scrollHeight with a max of 120px
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120;
      const newHeight = Math.min(scrollHeight, maxHeight);
      
      textareaRef.current.style.height = `${newHeight}px`;
      
      // Calculate approximate number of rows for padding adjustment
      const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight);
      const rows = Math.floor(newHeight / lineHeight);
      setInputRows(rows);
    }
  }, [newMessage]);

  // Load PDF.js for PDF preview
  useEffect(() => {
    // Dynamically load PDF.js if not already loaded
    if (!window.pdfjsLib && selectedFile && selectedFile.type === 'application/pdf' && isFileUploading) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        renderPdfPreview();
      };
      document.head.appendChild(script);
    } else if (selectedFile && selectedFile.type === 'application/pdf' && isFileUploading) {
      renderPdfPreview();
    }
  }, [selectedFile]);

  const renderPdfPreview = async () => {
    if (!selectedFile || selectedFile.type !== 'application/pdf') return;
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Get the first page for preview
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      setFilePreview({ 
        type: 'pdf', 
        url: canvas.toDataURL(),
        totalPages: pdf.numPages 
      });
    } catch (error) {
      console.error('Error rendering PDF preview:', error);
      setFilePreview({ type: 'document', url: null });
    }
  };

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
      } else if (file.type === 'application/pdf') {
        setFileType('pdf');
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
      } else if (file.type === 'application/pdf') {
        // PDF preview will be handled by the useEffect
        setFilePreview({ type: 'pdf', url: null, loading: true });
      } else {
        setFilePreview({ type: 'document', url: null });
      }
    }
  };

  useEffect(()=>{
    if(isFileUploading === false){
      removeFile();
    }
  },[isFileUploading])
  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setPdfPages([]);
    setCurrentPdfPage(1);
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

  const changePdfPage = (direction) => {
    if (filePreview.type === 'pdf' && filePreview.totalPages) {
      const newPage = currentPdfPage + direction;
      if (newPage >= 1 && newPage <= filePreview.totalPages) {
        setCurrentPdfPage(newPage);
        // In a real implementation, you would render the new page here
      }
    }
  };

  // Handle Enter key for message input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        setInputRows(1);
      }
    }
  };

  // Speech to text functions
  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition start error:', error);
        toast.error('Cannot start speech recognition. Please check your microphone permissions.');
      }
    } else {
      toast.error('Speech recognition is not supported in your browser.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // AI Assistant functions
  const handleAIClick = () => {
    setShowAIAssistant(!showAIAssistant);
    // Clear previous suggestions when opening
    if (!showAIAssistant) {
      setAiSuggestions([]);
      setAiPrompt('');
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAIGenerating(true);
    
    try {
      const response = await axios.post("http://localhost:4000/api/v1/ai/ask", {prompt: aiPrompt}, {withCredentials: true})
      if(response.data.success){
        setAiSuggestions(response.data.response)
      }
    } catch (error) {
      toast.error(error.response.data.message)
    }finally{
      setIsAIGenerating(false)
    }
  };

  const handleAIApply = (suggestion) => {
    setNewMessage(suggestion);
    setShowAIAssistant(false);
    setAiSuggestions([]);
    setAiPrompt('');
  };

  const SuggestionItem = ({ suggestion, onApply }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongMessage = suggestion.length > 150;
    const displayText = isLongMessage && !isExpanded 
      ? `${suggestion.substring(0, 150)}...` 
      : suggestion;

    return (
      <div className="bg-gray-50 rounded-md p-3">
        <div className="flex flex-col">
          <p className="text-sm text-gray-700 whitespace-pre-line mb-2 break-words">
            {displayText}
            {isLongMessage && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-800 text-xs ml-1 font-medium"
              >
                {isExpanded ? ' Show less' : ' Show more'}
              </button>
            )}
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => onApply(suggestion)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
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
      
      {/* AI Assistant Panel - Updated with microphone icon */}
      {showAIAssistant && (
        <div 
          ref={aiAssistantRef}
          className="fixed inset-x-0 bottom-20 z-20 bg-white p-4 rounded-t-lg shadow-lg border border-gray-200 md:absolute md:bottom-20 md:right-4 md:w-96 md:rounded-lg"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-800">AI Writing Assistant</h3>
            <button onClick={() => setShowAIAssistant(false)} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-4 relative">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="What would you like to say? Or click the mic to speak..."
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 text-sm h-28 resize-none"
              disabled={isAIGenerating}
            />
            <button
              onClick={isListening ? stopListening : startListening}
              className={`absolute right-3 top-3 p-1 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              type="button"
              disabled={isAIGenerating}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
            {isListening && (
              <div className="absolute right-12 top-3 flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping mr-1"></div>
                <span className="text-xs text-red-600">Listening...</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 mb-4">
            <button
              onClick={handleAIGenerate}
              disabled={!aiPrompt.trim() || isAIGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isAIGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </button>
          </div>
          
          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="mb-4 border-t border-gray-200 pt-4 flex-1 overflow-hidden flex flex-col">
              <p className="text-xs text-gray-500 mb-2 font-medium">AI Suggestions:</p>
              <div className="space-y-3 overflow-y-auto flex-1 pr-1 max-h-40 md:max-h-60">
                {aiSuggestions.map((suggestion, index) => (
                  <SuggestionItem 
                    key={index} 
                    suggestion={suggestion} 
                    onApply={handleAIApply}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Quick suggestions */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">Quick templates:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Professional email",
                "Meeting request", 
                "Thank you note",
                "Follow-up message"
              ].map((template) => (
                <button
                  key={template}
                  onClick={() => setAiPrompt(`write a ${template.toLowerCase()}`)}
                  className="text-xs p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 truncate"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* File Selection Menu */}
      {showFileMenu && (
        <div 
          ref={fileMenuRef}
          className="fixed inset-x-0 bottom-20 bg-white p-2 rounded-t-lg shadow-lg border border-gray-200 z-20 md:absolute md:bottom-20 md:left-4 md:rounded-lg"
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
        <div className="fixed inset-x-0 bottom-0 bg-white p-4 border border-gray-200 rounded-t-lg shadow-lg z-20 md:absolute md:bottom-full md:left-0 md:right-0 md:rounded-lg md:mb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-800">Send {fileType}</h3>
            <button onClick={removeFile} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* File Preview Content */}
          <div className="mb-4 max-h-60 overflow-y-auto">
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
            
            {filePreview?.type === 'pdf' && (
              <div className="flex flex-col items-center">
                {filePreview.loading ? (
                  <div className="flex items-center justify-center h-48 w-full bg-gray-100 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Loading PDF preview...</span>
                  </div>
                ) : filePreview.url ? (
                  <>
                    <div className="relative w-full">
                      <img 
                        src={filePreview.url} 
                        alt="PDF preview" 
                        className="max-h-64 w-full object-contain border border-gray-200 rounded-lg"
                      />
                      {filePreview.totalPages > 1 && (
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center">
                          <button 
                            onClick={() => changePdfPage(-1)}
                            disabled={currentPdfPage <= 1}
                            className="bg-white rounded-full p-1 shadow-md mr-2 disabled:opacity-50"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                            Page {currentPdfPage} of {filePreview.totalPages}
                          </span>
                          <button 
                            onClick={() => changePdfPage(1)}
                            disabled={currentPdfPage >= filePreview.totalPages}
                            className="bg-white rounded-full p-1 shadow-md ml-2 disabled:opacity-50"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </>
                ) : (
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
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a caption..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 text-sm resize-none"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
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
              disabled={isFileUploading}
            >
              {isFileUploading ? "Uploading..." : "Send"}
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
        
        <textarea
          ref={textareaRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400 text-sm sm:text-base resize-none"
          rows={1}
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
        
        {/* AI Assistant Button */}
        <button
          onClick={handleAIClick}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-purple-600"
        >
          <SparklesIcon className="w-6 h-6" />
        </button>
        
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className={`px-5 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 shadow-sm hover:shadow-md ${
            newMessage.trim() 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          style={{ alignSelf: inputRows > 1 ? 'flex-end' : 'center' }}
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