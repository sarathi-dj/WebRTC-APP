const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Store rooms: roomId -> [socketId, ...]
const rooms = {};
// Queue for random matching
let waitingQueue = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // ─── ROOM-BASED ───────────────────────────────────────────

  socket.on('create-room', () => {
    const roomId = uuidv4().slice(0, 8).toUpperCase();
    rooms[roomId] = [socket.id];
    socket.join(roomId);
    socket.currentRoom = roomId;
    socket.emit('room-created', { roomId });
    console.log(`Room created: ${roomId}`);
  });

  socket.on('join-room', ({ roomId }) => {
    const room = rooms[roomId.toUpperCase()];
    if (!room) {
      socket.emit('join-error', 'Room not found. Check your code and try again.');
      return;
    }
    if (room.length >= 2) {
      socket.emit('join-error', 'Room is full (max 2 participants).');
      return;
    }
    room.push(socket.id);
    socket.join(roomId.toUpperCase());
    socket.currentRoom = roomId.toUpperCase();
    // Tell existing user to initiate offer
    socket.to(roomId.toUpperCase()).emit('peer-joined', { peerId: socket.id });
    socket.emit('joined-room', { roomId: roomId.toUpperCase() });
    console.log(`User ${socket.id} joined room ${roomId.toUpperCase()}`);
  });

  // ─── RANDOM MATCHING ──────────────────────────────────────

  socket.on('find-random', () => {
    // Remove if already in queue
    waitingQueue = waitingQueue.filter(id => id !== socket.id);

    if (waitingQueue.length > 0) {
      const peerId = waitingQueue.shift();
      const roomId = 'RAND-' + uuidv4().slice(0, 6).toUpperCase();
      rooms[roomId] = [peerId, socket.id];

      socket.join(roomId);
      io.sockets.sockets.get(peerId)?.join(roomId);

      socket.currentRoom = roomId;
      if (io.sockets.sockets.get(peerId)) {
        io.sockets.sockets.get(peerId).currentRoom = roomId;
      }

      // Tell the waiting peer to initiate
      io.to(peerId).emit('random-matched', { roomId, initiator: true });
      socket.emit('random-matched', { roomId, initiator: false });
      console.log(`Random match: ${peerId} <-> ${socket.id} in ${roomId}`);
    } else {
      waitingQueue.push(socket.id);
      socket.emit('waiting-for-match');
      console.log(`User ${socket.id} waiting for random match`);
    }
  });

  socket.on('cancel-random', () => {
    waitingQueue = waitingQueue.filter(id => id !== socket.id);
    socket.emit('random-cancelled');
  });

  // ─── WEBRTC SIGNALING ─────────────────────────────────────

  socket.on('offer', ({ offer, roomId }) => {
    socket.to(roomId).emit('offer', { offer, from: socket.id });
  });

  socket.on('answer', ({ answer, roomId }) => {
    socket.to(roomId).emit('answer', { answer });
  });

  socket.on('ice-candidate', ({ candidate, roomId }) => {
    socket.to(roomId).emit('ice-candidate', { candidate });
  });

  // ─── DISCONNECT ───────────────────────────────────────────

  socket.on('leave-room', () => {
    handleLeave(socket);
  });

  socket.on('disconnect', () => {
    waitingQueue = waitingQueue.filter(id => id !== socket.id);
    handleLeave(socket);
    console.log('User disconnected:', socket.id);
  });

  function handleLeave(socket) {
    const roomId = socket.currentRoom;
    if (roomId && rooms[roomId]) {
      socket.to(roomId).emit('peer-left');
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
      socket.leave(roomId);
      socket.currentRoom = null;
    }
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
