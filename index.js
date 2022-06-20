const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static('public'));

var users = {};
function getUserList() {
  var userList = [];
  for (const user in users) userList.push({ id: user, name: users[user] });
  return userList;
}

io.on('connection', (socket) => {
  users[socket.id] = socket.handshake.query.username;
  io.emit('user list update', getUserList());

  socket.on('disconnect', () => {
    socket.broadcast.emit('chat message', {
      message: `<b>${users[socket.id]}</b> s'est déconnecté !`,
      system: true,
    });
    delete users[socket.id];
    io.emit('user list update', getUserList());
  });

  socket.on('username change', (newUser) => {
    users[socket.id] = newUser;
    io.emit('user list update', getUserList());
  });

  socket.on('chat message', (msg) => {
    if (!msg.system && msg.message.startsWith('/')) {
      msg.user = 'SYSTEM';
      msg.system = true;

      switch (msg.message.substring(1)) {
        case 'wemen':
          msg.message = 'bitch';
          break;
      }
    }
    io.emit('chat message', msg);
  });

  socket.broadcast.emit('chat message', {
    message: `<b>${users[socket.id]}</b> s'est connecté !`,
    system: true,
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
