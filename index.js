const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');

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
      content: `<b>${users[socket.id]}</b> s'est déconnecté !`,
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
    var allowMessage = true;

    if (!msg.system && msg.content.startsWith('/')) {
      var botMsg = {
        user: 'SYSTÈME (' + msg.user + ')',
        system: true,
      };

      var stuff = msg.content.trim().split(' ');
      stuff[0] = stuff[0].substring(1);
      switch (stuff[0]) {
        case 'web':
          botMsg.content =
            'Le site web de zuulaxx : <a href="https://zuulaxx.ml">ici</a>';
          break;
        case 'hey':
          botMsg.content = 'Bienvenue aux nouveaux 👋';
          break;
        case 'say':
          if (stuff.length > 1) {
            stuff.shift();
            botMsg.content = stuff.join(' ');
          } else {
            botMsg.content = 'Argument manquant !';
          }
          break;
      }

      if (botMsg.content) {
        allowMessage = false;
        io.emit('chat message', botMsg);
      }
    }

    if (allowMessage) {
      msg.content = sanitizeHtml(marked.parseInline(msg.content), {
        disallowedTagsMode: 'escape',
      }).trim();
      io.emit('chat message', msg);
    }
  });

  socket.broadcast.emit('chat message', {
    content: `<b>${users[socket.id]}</b> s'est connecté !`,
    system: true,
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
