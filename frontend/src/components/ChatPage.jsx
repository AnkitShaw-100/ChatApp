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

    // Listen for user join/leave notifications
    socket.on('userJoined', (notification) => {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        text: notification.message,
        sender: 'System',
        isSystemMessage: true,
        timestamp: notification.timestamp
      }]);
    });

    socket.on('userLeft', (notification) => {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        text: notification.message,
        sender: 'System',
        isSystemMessage: true,
        timestamp: notification.timestamp
      }]);
    });

    // Listen for user list updates
    socket.on('userList', (users) => {
      setConnectedUsers(users);
    });

    // Listen for typing status
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Chat Window Container */}
      <div className="w-full max-w-4xl h-[700px] bg-white rounded-lg shadow-xl border border-gray-200 flex">
        
        {/* Sidebar - User List */}
        <div className="w-1/4 bg-gray-50 rounded-l-lg border-r border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Online Users ({connectedUsers.length})
          </h3>
          <div className="space-y-2">
            {connectedUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className={`text-sm ${user.name === username ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                  {user.name} {user.name === username && '(You)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 rounded-tr-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Profile Avatar */}
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">{username?.[0]?.toUpperCase()}</span>
                </div>
                {/* Chat Info */}
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Group Chat</h1>
                  <p className="text-sm text-gray-500">
                    {getTypingText() || `${connectedUsers.length} members online`}
                  </p>
                </div>
              </div>
              {/* User Status */}
              <div className="text-sm text-gray-500">
                Signed in as <span className="font-medium text-gray-700">{username}</span>
              </div>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <p>Welcome to the group chat! Start the conversation...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isSystemMessage ? 'justify-center' : 'justify-start'}`}>
                  {msg.isSystemMessage ? (
                    <div className="text-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {msg.text}
                    </div>
                  ) : (
                    <div className={`max-w-xs lg:max-w-md ${msg.senderId === socket?.id ? 'ml-auto' : ''}`}>
                      <div className={`p-3 rounded-lg shadow-sm ${
                        msg.senderId === socket?.id 
                          ? 'bg-blue-500 text-white rounded-br-none' 
                          : 'bg-gray-200 text-gray-900 rounded-bl-none'
                      }`}>
                        {msg.senderId !== socket?.id && (
                          <div className="font-medium text-xs text-gray-600 mb-1">
                            {msg.sender}
                          </div>
                        )}
                        <div className="text-sm">{msg.text}</div>
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
          <div className="bg-white border-t border-gray-200 px-6 py-4 rounded-br-lg">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white text-gray-700 placeholder-gray-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`font-medium px-6 py-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
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