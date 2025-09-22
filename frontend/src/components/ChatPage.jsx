import React, { useState } from 'react';

export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    // Static demo messages - you can replace these with dynamic data later
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      // Here you would typically send the message via Socket.IO
      // For now, just adding to local state as demo
      setMessages([...messages, {
        id: Date.now(),
        text: message,
        sender: 'You',
        timestamp: new Date()
      }]);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Chat Window Container */}
      <div className="w-full max-w-2xl h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Profile Avatar */}
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">R</span>
              </div>
              {/* Chat Info */}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Realtime group chat</h1>
                <p className="text-sm text-gray-500">Someone is typing...</p>
              </div>
            </div>
            {/* User Status */}
            <div className="text-sm text-gray-500">
              Signed in as <span className="font-medium text-gray-700">Rakesh</span>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-gray-50 p-3 rounded-lg shadow-sm border">
                  <div className="font-medium text-sm text-gray-600">{msg.sender}</div>
                  <div className="text-gray-900">{msg.text}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 rounded-b-lg">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white text-gray-700 placeholder-gray-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}