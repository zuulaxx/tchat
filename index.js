const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static('public'));

var users = {};
function userExists(username) {
  for (const user in users) if (users[user] == username) return true;
  return false;
}
function doggoCheck(socket) {
  if (userExists(socket.handshake.query.username)) {
    socket.emit('error', {
      code: 'user_exists',
      message: "Ce nom d'utilisateur est déjà pris !",
    });
    socket.leave();
    return true;
  } else return false;
}
function getUserList() {
  var userList = [];
  for (const user in users) userList.push({ id: user, name: users[user] });
  return userList;
}

io.on('connection', (socket) => {
  if (doggoCheck(socket)) return;
  users[socket.id] = socket.handshake.query.username;
  io.emit('user list update', getUserList());

  socket.on('disconnect', () => {
    socket.broadcast.emit('chat message', {
      message: `<b>${users[socket.id]}</b> s'est déconnecté !`,
      type: 'system',
    });
    socket.broadcast.emit('user leave', {
      id: socket.id,
      name: users[socket.id],
    });
    delete users[socket.id];
    io.emit('user list update', getUserList());
  });

  socket.on('username change', (newUser) => {
    doggoCheck(socket);
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
