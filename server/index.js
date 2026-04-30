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
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'], credentials: true }
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'));

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

// userId → { username, sockets: Set<socketId> }
const onlineUsers = new Map();

const getOnlineUsers = () =>
  [...onlineUsers.values()].map(({ username }) => ({ username }));

io.on('connection', async (socket) => {
  const { username, id: userId } = socket.user;

  // Track by userId — multiple tabs/sockets handled cleanly
  if (onlineUsers.has(userId)) {
    onlineUsers.get(userId).sockets.add(socket.id);
  } else {
    onlineUsers.set(userId, { username, sockets: new Set([socket.id]) });
  }

  console.log(`${username} connected | socket: ${socket.id} | unique online: ${onlineUsers.size}`);

  // Send message history to this socket only
  const history = await Message.find()
    .sort({ createdAt: -1 }).limit(50).lean();
  socket.emit('history', history.reverse());

  // Broadcast updated online list to everyone
  io.emit('onlineUsers', getOnlineUsers());

  socket.on('sendMessage', async (text) => {
    if (!text?.trim()) return;
    const message = await Message.create({
      text: text.trim(),
      username,
      userId,
    });
    io.emit('newMessage', message);
  });

  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('userTyping', { username, isTyping });
  });

  socket.on('requestHistory', async () => {
    const history = await Message.find()
      .sort({ createdAt: -1 }).limit(50).lean();
    socket.emit('history', history.reverse());
  });

  socket.on('disconnect', () => {
    const userData = onlineUsers.get(userId);
    if (userData) {
      userData.sockets.delete(socket.id);
      // Only mark user as offline when ALL their sockets are gone
      if (userData.sockets.size === 0) {
        onlineUsers.delete(userId);
        console.log(`${username} fully offline | unique online: ${onlineUsers.size}`);
      } else {
        console.log(`${username} closed one tab | remaining sockets: ${userData.sockets.size}`);
      }
    }
    io.emit('onlineUsers', getOnlineUsers());
  });
});

httpServer.listen(5000, () => console.log('Server running on port 5000'));