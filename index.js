const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static('public'));

var users = {};

io.on('connection', (socket) => {
  users[socket.id] = socket.handshake.query.username;

  socket.on('disconnect', () => {
    delete users[socket.id];
    socket.broadcast.emit('chat message', {
      message: `<b>${users[socket.id]}</b> s'est déconnecté !`,
      type: 'system',
    });
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.broadcast.emit('chat message', {
    message: `<b>${users[socket.id]}</b> s'est connecté !`,
    type: 'system',
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

// TODO : Rajouter le thème sombre et le nombre d'utilisateurs connectés actuellement.
