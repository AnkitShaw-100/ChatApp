import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext.jsx';

export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const { socket, sendMessage, sendTypingStatus, currentUser } = useSocket();
  const username = location.state?.username || currentUser?.name;

  // Redirect if no username
  useEffect(() => {
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('receiveMessage', (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    // User joined
    socket.on('userJoined', (notification) => {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        text: notification.message,
        sender: 'System',
        isSystemMessage: true,
        timestamp: notification.timestamp
      }]);
    });

    // User left
    socket.on('userLeft', (notification) => {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        text: notification.message,
        sender: 'System',
        isSystemMessage: true,
        timestamp: notification.timestamp
      }]);
    });

    // Update user list
    socket.on('userList', (users) => {
      setConnectedUsers(users);
    });

    // Typing status
    socket.on('userTyping', ({ userName, isTyping }) => {
      setTypingUsers(prev => {
        if (isTyping) {
          return prev.includes(userName) ? prev : [...prev, userName];
        } else {
          return prev.filter(user => user !== userName);
        }
      });
    });

    // Cleanup listeners
    return () => {
      socket.off('receiveMessage');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('userList');
      socket.off('userTyping');
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
      
      // Stop typing when message is sent
      if (isTyping) {
        setIsTyping(false);
        sendTypingStatus(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Handle typing status
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(false);
    }, 1000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTypingText = () => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    return `${typingUsers.slice(0, -1).join(', ')} and ${typingUsers[typingUsers.length - 1]} are typing...`;
  };

  if (!username) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 sm:p-4">
      {/* Chat Window Container */}
      <div className="w-full max-w-4xl h-[calc(100vh-1rem)] sm:h-[700px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col sm:flex-row">
        
        {/* Sidebar - User List */}
        <div className="hidden sm:block sm:w-1/4 bg-gray-50 sm:rounded-l-lg border-r border-gray-200 p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
            Online Users ({connectedUsers.length})
          </h3>
          <div className="space-y-1.5 sm:space-y-2">
            {connectedUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-2 p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                <span className={`text-xs sm:text-sm ${user.name === username ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                  {user.name} {user.name === username && '(You)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 rounded-t-lg sm:rounded-tr-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                {/* Profile Avatar */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm sm:text-lg">{username?.[0]?.toUpperCase()}</span>
                </div>
                {/* Chat Info */}
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Group Chat</h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {getTypingText() || `${connectedUsers.length} members online`}
                  </p>
                </div>
              </div>
              {/* User Status - Hidden on mobile */}
              <div className="hidden sm:block text-sm text-gray-500 flex-shrink-0">
                Signed in as <span className="font-medium text-gray-700">{username}</span>
              </div>
              {/* Mobile user count */}
              <div className="sm:hidden text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
                {connectedUsers.length}
              </div>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10 sm:mt-20">
                <p className="text-sm sm:text-base px-4">Welcome to the group chat! Start the conversation...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isSystemMessage ? 'justify-center' : 'justify-start'}`}>
                  {msg.isSystemMessage ? (
                    <div className="text-center text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                      {msg.text}
                    </div>
                  ) : (
                    <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md ${msg.senderId === socket?.id ? 'ml-auto' : ''}`}>
                      <div className={`p-2.5 sm:p-3 rounded-lg shadow-sm ${
                        msg.senderId === socket?.id 
                          ? 'bg-blue-500 text-white rounded-br-none' 
                          : 'bg-gray-200 text-gray-900 rounded-bl-none'
                      }`}>
                        {msg.senderId !== socket?.id && (
                          <div className="font-medium text-xs text-gray-600 mb-1">
                            {msg.sender}
                          </div>
                        )}
                        <div className="text-sm break-words">{msg.text}</div>
                        <div className={`text-xs mt-1 ${
                          msg.senderId === socket?.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Area */}
          <div className="bg-white border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4 rounded-b-lg sm:rounded-br-lg">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white text-gray-700 placeholder-gray-500 text-sm sm:text-base"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`font-medium px-4 py-2.5 sm:px-6 sm:py-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm sm:text-base ${
                  message.trim()
                    ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}