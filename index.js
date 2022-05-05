const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static('public'));

// var users = [];
var users = 0;

io.on('connection', (socket) => {
  socket.broadcast.emit('chat message', {
    message: "Un utilisateur s'est connecté !",
    type: 'system',
  });
  users++;
  console.log(users + ' utilisateurs');
  socket.on('disconnect', () => {
    socket.broadcast.emit('chat message', {
      message: "Un utilisateur s'est déconnecté !",
      type: 'system',
    });
    users--;
    console.log(users + ' utilisateurs');
  });
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
