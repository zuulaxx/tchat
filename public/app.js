const messages = document.getElementById('messages');
const form = document.getElementById('msg-form');
const input = document.getElementById('msg-input');

var username = localStorage.getItem('username');
function promptUsername() {
  const msg = "Quel est ton nom d'utilisateur ?";
  var tempName;

  if (username == null) tempName = prompt(msg);
  else tempName = prompt(msg, username);

  if (tempName != null && tempName.length > 0 && tempName != username) {
    username = tempName;
    localStorage.setItem('username', username);
  }
}
document.getElementById('new-username').onclick = promptUsername;
if (username == null) promptUsername();

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
    item.classList.add('msg-system');
  } else item.innerHTML = '<b>' + msg.user + ' :</b> ' + msg.message;

  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
