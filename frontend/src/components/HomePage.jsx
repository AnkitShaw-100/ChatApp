import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext.jsx';

export default function NameEntryPage() {
    const [name, setName] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const navigate = useNavigate();
    const { joinRoom, isConnected } = useSocket();

    const handleSubmit = async () => {
        if (name.trim() && isConnected) {
            setIsJoining(true);
            console.log('Name entered:', name);
            
            joinRoom(name);
        
            navigate('/chat', { state: { username: name } });
        } else if (!isConnected) {
            alert('Please wait for connection to the server...');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-sm sm:max-w-md mx-auto">
                <div className="text-center">
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                        Enter your name
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-2">
                        Enter your name to start chatting. This will be used to identify
                    </p>

                    <div className="space-y-4 sm:space-y-6">
                        <div>
                            <input
                                type="text"
                                placeholder="Your name (e.g. John Doe)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-green-400 rounded-lg focus:outline-none focus:border-green-500 text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!name.trim() || !isConnected || isJoining}
                            className={`w-full font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm sm:text-base ${
                                !name.trim() || !isConnected || isJoining
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500'
                            }`}
                        >
                            {isJoining ? 'Joining...' : !isConnected ? 'Connecting...' : 'Continue'}
                        </button>
                        
                        <div className="text-center text-xs sm:text-sm">
                            <span className={`inline-flex items-center ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                                <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {isConnected ? 'Connected to server' : 'Connecting to server...'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}