import express from 'express';
import http from 'http';
import sanitizeHtml from 'sanitize-html';
import jsoning from 'jsoning';
import { Server } from 'socket.io';
import { marked } from 'marked';

const database = new jsoning('database.json');

let oldmsg = database.get('oldmsg');
console.dirxml(oldmsg);

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));

let users = {};
function getUserList() {
  let userList = [];
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
      timestamp: Date.now(),
    });
    delete users[socket.id];
    io.emit('user list update', getUserList());
  });

  socket.on('username change', (newUser) => {
    users[socket.id] = newUser;
    io.emit('user list update', getUserList());
  });

  socket.on('chat message', async (msg) => {
    let sendMessage = true;
    let timestamp = Date.now();

    if (!msg.system && msg.content.startsWith('/')) {
      let botMsg = {
        user: 'SYSTÈME (' + msg.user + ')',
        system: true,
        timestamp: timestamp,
      };

      let stuff = msg.content.trim().split(' ');
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
        case 'dbclear':
          botMsg.content = 'DataBase is clear !';
          database.clear();
          break;
        case 'db':
          botMsg.content = `Voici le contenue de la database : ${console.log(
            oldmsg
          )}`;
          console.log(oldmsg);
          break;
      }

      if (botMsg.content) {
        sendMessage = false;
        io.emit('chat message', botMsg);
      }
    }

    if (sendMessage) {
      msg.content = sanitizeHtml(marked.parseInline(msg.content), {
        disallowedTagsMode: 'escape',
      }).trim();
      msg.timestamp = timestamp;

      await database.push('oldmsg', msg);
      io.emit('chat message', msg);
      await database.get('oldmsg');
    }
  });

  socket.broadcast.emit('chat message', {
    content: `<b>${users[socket.id]}</b> s'est connecté !`,
    system: true,
  });
});

const port = 1234;
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
