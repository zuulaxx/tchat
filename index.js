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
  console.log(userList);
  return userList;
}

io.on('connection', (socket) => {
  users[socket.id] = socket.handshake.query.username;
  io.emit('user list update', getUserList());

  socket.on('disconnect', () => {
    socket.broadcast.emit('chat message', {
      message: `<b>${users[socket.id]}</b> s'est déconnecté !`,
      type: 'system',
    });
    // socket.broadcast.emit('user leave', {
    //   id: socket.id,
    //   name: users[socket.id],
    // });
    delete users[socket.id];
    socket.removeAllListeners();
    io.emit('user list update', getUserList());
  });

  socket.on('username change', (newUser) => {
    users[socket.id] = newUser;
    console.log('user change!!!');
    io.emit('user list update', getUserList());
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
