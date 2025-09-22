import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NameEntryPage() {
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleSubmit = () => {
        if (name.trim()) {
            console.log('Name entered:', name);
            // Navigate to chat page
            navigate('/chat');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                        Enter your name
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Enter your name to start chatting. This will be used to identify
                    </p>

                    <div className="space-y-6">
                        <div>
                            <input
                                type="text"
                                placeholder="Your name (e.g. John Doe)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full px-4 py-3 border-2 border-green-400 rounded-lg focus:outline-none focus:border-green-500 text-gray-700 placeholder-gray-400"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}