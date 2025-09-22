import { createServer } from "node:http";
import express from "express";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const ROOM = "group";
const connectedUsers = new Map(); // Store connected users

io.on("connection", (socket) => {
  console.log("A user connected.", socket.id);

  // Handle user joining the room
  socket.on("joinRoom", async (userName) => {
    console.log(`${userName} is joining the group.`);
    
    // Store user info
    connectedUsers.set(socket.id, {
      id: socket.id,
      name: userName,
      isTyping: false
    });
    
    await socket.join(ROOM);
    
    // Notify all users that someone joined
    socket.to(ROOM).emit("userJoined", {
      userName,
      message: `${userName} joined the chat`,
      timestamp: new Date()
    });
    
    // Send current user list to the new user
    const userList = Array.from(connectedUsers.values());
    socket.emit("userList", userList);
    
    // Send updated user list to all users
    io.to(ROOM).emit("userList", userList);
  });

  // Handle sending messages
  socket.on("sendMessage", (messageData) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const message = {
        id: Date.now(),
        text: messageData.text,
        sender: user.name,
        senderId: socket.id,
        timestamp: new Date()
      };
      
      console.log(`Message from ${user.name}: ${messageData.text}`);
      
      // Send message to all users in the room
      io.to(ROOM).emit("receiveMessage", message);
    }
  });

  // Handle typing status
  socket.on("typing", (isTyping) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      user.isTyping = isTyping;
      
      // Send typing status to other users (not to sender)
      socket.to(ROOM).emit("userTyping", {
        userName: user.name,
        isTyping: isTyping
      });
      
      console.log(`${user.name} is ${isTyping ? 'typing' : 'not typing'}`);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`${user.name} disconnected`);
      
      // Remove user from connected users
      connectedUsers.delete(socket.id);
      
      // Notify other users that someone left
      socket.to(ROOM).emit("userLeft", {
        userName: user.name,
        message: `${user.name} left the chat`,
        timestamp: new Date()
      });
      
      // Send updated user list to remaining users
      const userList = Array.from(connectedUsers.values());
      socket.to(ROOM).emit("userList", userList);
    }
  });
});

app.get("/", (req, res) => {
  res.send("<h1>Chat Server Running</h1><p>Connected users: " + connectedUsers.size + "</p>");
});

server.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
