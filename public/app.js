const messages = document.getElementById('messages');
const membersBar = document.getElementById('members-bar');
const form = document.getElementById('msg-form');
const input = document.getElementById('msg-input');
const themeBtn = document.getElementById('theme-btn');

var username = localStorage.getItem('username');
var forcePrompt = false;
function promptUsername() {
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
  promptUsername();
};
if (username == null) promptUsername();

function changeTheme(state) {
  if (state == null) {
    var savedState = localStorage.getItem('themeIsDark');
    if (savedState == null)
      state =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    else state = savedState != 'false';
  }

  localStorage.setItem('themeIsDark', state);

  if (state) {
    document.body.classList.add('dark');
    themeBtn.textContent = '☀️';
  } else {
    document.body.classList.remove('dark');
    themeBtn.textContent = '🌙';
  }
  //console.log("zuulaxx te remercie d'utiliser son tchat");
}
changeTheme();
themeBtn.onclick = function () {
  changeTheme(localStorage.getItem('themeIsDark') == 'false');
};
const socket = io({
  query: { username: username },
  upgrade: false,
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', { content: input.value, user: username });
    input.value = '';
  }
});

socket.on('error', function (err) {
  console.error("Une erreur s'est produite sur le serveur !", err);
  alert(err.message);
});

socket.on('user list update', function (userList) {
  membersBar.innerHTML = `<h3>Utilisateurs - ${userList.length} :</h3>`;
  const list = document.createElement('ul');
  for (const user of userList) {
    const el = document.createElement('li');
    el.innerText = user.name;
    list.appendChild(el);
  }
  membersBar.appendChild(list);
});

// // Création du timestamp
// var timestamp = Date.now();
// console.log(timestamp);
 
// // Convertir le timestamp en date et heure lisibles par l'homme
// var date = new Date(timestamp);
// console.log(date);

socket.on('chat message', function (msg) {
  const item = document.createElement('li');
  if (msg.system) item.classList.add('msg-system');
  if (msg.user) item.innerHTML = `<b>${msg.user} :</b> `;
  item.innerHTML += msg.content;

  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});