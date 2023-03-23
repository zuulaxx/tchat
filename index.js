import express from 'express';
import http from 'http';
import sanitizeHtml from 'sanitize-html';
import { Server } from 'socket.io';
import { marked } from 'marked';

const server = http.createServer(express().use(express.static('public')));
const io = new Server(server);

let users = {};
function updateUsers() {
  let userList = [];
  for (const user in users) userList.push({ id: user, name: users[user] });
  io.emit('user list update', userList);
}

io.on('connection', (socket) => {
  let username = socket.handshake.query.username;
  users[socket.id] = username;

  socket.on('username change', (newUsername) => {
    io.emit('chat message', {
      user: 'SYSTÈME',
      system: true,
      content: `<b>${username}</b> a changé son nom pour <b>${newUsername}</b>`,
      timestamp: Date.now(),
    });
    users[socket.id] = username = newUsername;
    updateUsers();
  });

  socket.on('chat message', (msg) => {
    msg.content = msg.content.trim();
    if (/\S/.test(msg.content)) {
      msg.content = sanitizeHtml(marked.parseInline(msg.content), {
        disallowedTagsMode: 'escape',
      });
      msg.user = username;
      msg.timestamp = Date.now();

      io.emit('chat message', msg);

      if (!msg.system && msg.content.startsWith('/')) {
        let botMsg = {
          user: 'SYSTÈME',
          system: true,
          timestamp: msg.timestamp,
        };

        let stuff = msg.content.split(' ');
        stuff[0] = stuff[0].substring(1);
        switch (stuff[0]) {
          case 'web':
            botMsg.content =
              'Le site web de zuulaxx : <a href="https://zuulaxx.ml">ici</a>';
            break;
          case 'hey':
            ("attention");
            botMsg.content = 'Bienvenue aux nouveaux 👋';
            break;
          case 'clear':
            const msg = "Quel est ton nom d'utilisateur ?";
            prompt(msg) // Faire prompt un bouton avec marquer actualiser visible par tout les utilisateurs connéctées qui au click actualisera la page et donc supprimera les messages
            botMsg.content = 'Tout les messages ont bien été supprimées !';
            break;
        }

        if (botMsg.content) io.emit('chat message', botMsg);
      }
    }
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('chat message', {
      content: `<b>${users[socket.id]}</b> s'est déconnecté !`,
      system: true,
      timestamp: Date.now(),
    });
    delete users[socket.id];
    updateUsers();
  });

  updateUsers();
  socket.broadcast.emit('chat message', {
    content: `<b>${users[socket.id]}</b> s'est connecté !`,
    system: true,
  });
});

const port = 1234;
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
