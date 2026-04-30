const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authRoutes = require('./src/routes/auth');
const Message = require('./src/models/Message');
require('dotenv').config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'));

// Socket.io middleware — verify JWT on connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;   // attach user info to socket
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

// Track online users  {socketId: {username, userId}}
const onlineUsers = new Map();

io.on('connection', async (socket) => {
  const { username, id: userId } = socket.user;
  onlineUsers.set(socket.id, { username, userId });

  // Send last 50 messages to the newly connected user
  const history = await Message.find()
    .sort({ createdAt: -1 }).limit(50).lean();
  socket.emit('history', history.reverse());

  // Broadcast updated online users list to everyone
  io.emit('onlineUsers', [...onlineUsers.values()]);
  console.log(`${username} connected`);

  // Handle incoming message
  socket.on('sendMessage', async (text) => {
    if (!text?.trim()) return;
    const message = await Message.create({
      text: text.trim(),
      username,
      userId,
    });
    // Broadcast to ALL connected clients
    io.emit('newMessage', message);
  });

  // Typing indicator
  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('userTyping', { username, isTyping });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.emit('onlineUsers', [...onlineUsers.values()]);
    console.log(`${username} disconnected`);
  });
});

httpServer.listen(5000, () => console.log('Server running on port 5000'));