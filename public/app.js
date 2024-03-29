(function () {
  const messagesUI = document.getElementById('msg-ui');
  const messages = document.getElementById('messages');
  const membersBar = document.getElementById('members-bar');
  const form = document.getElementById('msg-form');
  const input = document.getElementById('msg-input');
  const themeBtn = document.getElementById('theme-btn');

  let username = localStorage.getItem('username');
  function promptUsername(socket) {
    const msg = "Quel est ton nom d'utilisateur ?";
    let tempName;

    if (username == null) tempName = prompt(msg);
    else tempName = prompt(msg, username);

    if (tempName != null && tempName.length > 0 && tempName != username) {
      username = tempName;
      localStorage.setItem('username', tempName);
      if (socket != null) socket.emit('username change', tempName);
    }
  }

  if (username == null) promptUsername();
  const socket = io({
    query: { username: username },
    upgrade: false,
  });

  document.getElementById('account-btn').onclick = function () {
    promptUsername(socket);
  };

  function changeTheme(state) {
    if (state == null) {
      let savedState = localStorage.getItem('themeIsDark');
      if (savedState == null)
        state =
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches;
      else state = savedState != 'false';
    }

    localStorage.setItem('themeIsDark', state);

    if (state) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      themeBtn.textContent = '☀️';
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      themeBtn.textContent = '🌙';
    }
  }
  changeTheme();
  themeBtn.onclick = function () {
    changeTheme(localStorage.getItem('themeIsDark') == 'false');
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', { content: input.value });
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

  socket.on('chat message', function (msg) {
    const item = document.createElement('li');
    if (msg.system) item.classList.add('msg-system');
    if (msg.user) {
      const date = new Date(msg.timestamp);
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let hours = date.getHours();
      let minutes = date.getMinutes();
      if (day < 10) day = `0${day}`;
      if (month < 10) month = `0${month}`;
      if (hours < 10) hours = `0${hours}`;
      if (minutes < 10) minutes = `0${minutes}`;
      item.innerHTML = `<span class="date">Le ${day}/${month}/${date.getFullYear()} à ${hours}:${minutes}</span><br /><b>${
        msg.user
      } :</b> `;
    }
    item.innerHTML += msg.content;
    messages.appendChild(item);
    messagesUI.scrollTop = messagesUI.scrollHeight;
  });
})();
