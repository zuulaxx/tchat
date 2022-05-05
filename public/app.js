const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');

// TODO : faire un bouton pour changer le nom d'utilisateur et dire si il est pris ou non.
var username = localStorage.getItem('username');
if (username == null) {
  username = prompt("Quel est ton nom d'utilisateur ?");
  localStorage.setItem('username', username);
}

const socket = io({ query: { username: username } });

form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', { message: input.value, user: username });
    input.value = '';
  }
});

socket.on('chat message', function (msg) {
  const item = document.createElement('li');
  if (msg.type == 'system') {
    item.innerHTML = msg.message;
    item.classList.add('system-message');
  } else item.innerHTML = '<b>' + msg.user + ' :</b> ' + msg.message;

  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
