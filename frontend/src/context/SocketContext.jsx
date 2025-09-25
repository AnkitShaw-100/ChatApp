import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const socketInstance = io('https://chatapp-2-bvfh.onrender.com/');
    
    socketInstance.on('connect', () => {
      console.log('Connected to server with socket ID:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection failed:', error);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinRoom = (userName) => {
    if (socket && userName) {
      socket.emit('joinRoom', userName);
      setCurrentUser({ name: userName, id: socket.id });
    }
  };

  const sendMessage = (message) => {
    if (socket && message.trim()) {
      socket.emit('sendMessage', { text: message });
    }
  };

  const sendTypingStatus = (isTyping) => {
    if (socket) {
      socket.emit('typing', isTyping);
    }
  };

  const value = {
    socket,
    isConnected,
    currentUser,
    setCurrentUser,
    joinRoom,
    sendMessage,
    sendTypingStatus
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};