const messages = document.getElementById('messages');
const memBar = document.getElementById('members-bar');
const form = document.getElementById('msg-form');
const input = document.getElementById('msg-input');

var username = localStorage.getItem('username');
var forcePrompt = false;
function promptUsername(socket) {
  const msg = "Quel est ton nom d'utilisateur ?";
  var tempName;

  if (username == null) tempName = prompt(msg);
  else tempName = prompt(msg, username);

  if (tempName != null && tempName.length > 0 && tempName != username) {
    username = tempName;
    localStorage.setItem('username', tempName);
    if (socket != null) return socket.emit('username change', tempName);
  }
}
document.getElementById('account-btn').onclick = function () {
  promptUsername(socket);
};
if (username == null) promptUsername();

const socket = io({
  query: { username: username },
  upgrade: false,
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', { message: input.value, user: username });
    input.value = '';
  }
});

socket.on('error', function (err) {
  console.error("Une erreur s'est produite sur le serveur !", err);
  alert(err.message);
});

socket.on('user list update', function (userList) {
  console.log(userList);
  memBar.innerHTML = `<h3>Utilisateurs - ${userList.length} :</h3>`;
  const list = document.createElement('ul');
  for (const user of userList) {
    const el = document.createElement('li');
    el.innerText = user.name;
    list.appendChild(el);
  }
  memBar.appendChild(list);
});

socket.on('chat message', function (msg) {
  const item = document.createElement('li');
  if (msg.system) item.classList.add('msg-system');
  if (msg.user != undefined && msg.user != null)
    item.innerHTML = '<b>' + msg.user + ' :</b> ';
  item.innerHTML += msg.message;

  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
