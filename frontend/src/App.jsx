import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext.jsx'
import HomePage from "./components/HomePage.jsx"
import ChatPage from "./components/ChatPage.jsx"

const App = () => {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </Router>
    </SocketProvider>
  )
}

export default App
