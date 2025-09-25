import { createServer } from "node:http"; // express ko ek HTTP server me wrap karte hai (kyunki socket.io ko raw server chahiye)
import express from "express"; // normal HTTP routes ke liye (web pages serve karne ke liye)
import { Server } from "socket.io"; // ye WebSocket banata hai (real-time communication ke liye)

const app = express();
const server = createServer(app); // Ek express app aur uska server ban gaya

// Socket.io ka server bana liya
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 1. Room join krnaa -----------------------------------------------------------
const ROOM = "group";
// connectedUsers → map me store hoga kaun user connected hai
const connectedUsers = new Map();
// Key = socket.id (unique id har user ke liye).
// Value = user ka data (id, name, typing status).

// Jab bhi koi naya banda connect karega, ye function chalega.
io.on("connection", (socket) => {
  // socket.id unique hoga har ek ke liye.
  console.log("A user connected.", socket.id);

  socket.on("joinRoom", async (userName) => {
    console.log(`${userName} is joining the group.`);

    // Us user ko connectedUsers list me daal diya
    connectedUsers.set(socket.id, {
      id: socket.id,
      name: userName,
      isTyping: false,
    });

    // User group room me chala gaya
    await socket.join(ROOM);

    // Dusre users ko bataya ki naya banda join hua hai
    socket.to(ROOM).emit("userJoined", {
      userName,
      message: `${userName} joined the chat`,
      timestamp: new Date(),
    });

    // Pehle new user ko current users list di
    const userList = Array.from(connectedUsers.values());
    socket.emit("userList", userList);

    // Fir sabko updated list bhej di
    io.to(ROOM).emit("userList", userList);
  });

  // 2. Message bhejna -----------------------------------------------------------
  // Handle sending messages
  // Message object bana liya (text + sender + time)
  socket.on("sendMessage", (messageData) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const message = {
        id: Date.now(),
        text: messageData.text,
        sender: user.name,
        senderId: socket.id,
        timestamp: new Date(),
      };

      console.log(`Message from ${user.name}: ${messageData.text}`);

      // Ye message sabhi users ko broadcast kar diya
      io.to(ROOM).emit("receiveMessage", message);
    }
  });

  // 3. Typing indicator -----------------------------------------------------------
  // Jab user type kar raha hoga to frontend ye event bhejega
  socket.on("typing", (isTyping) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      user.isTyping = isTyping;

      // Dusre users ko dikhaya jaayega ki “ye banda typing kar raha hai
      socket.to(ROOM).emit("userTyping", {
        userName: user.name,
        isTyping: isTyping,
      });

      console.log(`${user.name} is ${isTyping ? "typing" : "not typing"}`);
    }
  });

  // Handling user disconnect -----------------------------------------------------------
  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`${user.name} disconnected`);

      // RUs user ko list se hata diya
      connectedUsers.delete(socket.id);

      // Dusre users ko notify kiya ki banda chala gaya
      socket.to(ROOM).emit("userLeft", {
        userName: user.name,
        message: `${user.name} left the chat`,
        timestamp: new Date(),
      });

      // Updated list sabko bhej di
      const userList = Array.from(connectedUsers.values());
      socket.to(ROOM).emit("userList", userList);
    }
  });
});

app.get("/", (req, res) => {
  res.send(
    "<h1>Chat Server Running</h1><p>Connected users: " +
      connectedUsers.size +
      "</p>"
  );
});

server.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
