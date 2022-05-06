const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static('public'));

var users = {};
function userExists(username) {
  var duhArray = [];
  for (const user of users) {
    if (user == username) duhArray.push(user);
  }
  return duhArray;
}

io.on('connection', (socket) => {
  users[socket.id] = socket.handshake.query.username;
  console.log(userExists(users[socket.id]));

  socket.on('disconnect', () => {
    socket.broadcast.emit('chat message', {
      message: `<b>${users[socket.id]}</b> s'est déconnecté !`,
      type: 'system',
    });
    delete users[socket.id];
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
