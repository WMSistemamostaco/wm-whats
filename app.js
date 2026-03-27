/* =====================
   WM WHATS EMPRESA - JS
   ===================== */

// ─────────────── STATE ───────────────
let state = {
  currentUser: null,
  currentChat: null, // { type: 'sector'|'user', id: string }
  users: [],
  sectors: [],
  messages: {}, // key: "sector_ID" or "dm_ID1_ID2"
  unread: {}
};

const ADMIN_PASS = 'wm2025admin'; // senha extra para criar conta admin

// ─────────────── STORAGE ───────────────
function save() {
  localStorage.setItem('wm_users', JSON.stringify(state.users));
  localStorage.setItem('wm_sectors', JSON.stringify(state.sectors));
  localStorage.setItem('wm_messages', JSON.stringify(state.messages));
}

function load() {
  state.users = JSON.parse(localStorage.getItem('wm_users') || '[]');
  state.sectors = JSON.parse(localStorage.getItem('wm_sectors') || '[]');
  state.messages = JSON.parse(localStorage.getItem('wm_messages') || '{}');

  // Default sectors
  if (state.sectors.length === 0) {
    state.sectors = [
      { id: 'geral', name: 'Geral', icon: 'fa-comments', color: '#00d4ff' },
      { id: 'administrativo', name: 'Administrativo', icon: 'fa-briefcase', color: '#00e676' },
      { id: 'comercial', name: 'Comercial', icon: 'fa-chart-line', color: '#ff6b35' },
      { id: 'financeiro', name: 'Financeiro', icon: 'fa-dollar-sign', color: '#ffd700' },
      { id: 'ti', name: 'TI / Tecnologia', icon: 'fa-code', color: '#a855f7' },
      { id: 'rh', name: 'Recursos Humanos', icon: 'fa-users', color: '#ff3366' }
    ];
    save();
  }
}

// ─────────────── INIT ───────────────
window.onload = function () {
  load();
  spawnParticles();
  populateSectorSelects();

  // Check session
  const session = sessionStorage.getItem('wm_session');
  if (session) {
    const user = state.users.find(u => u.id === session);
    if (user) {
      loginUser(user);
      return;
    }
  }

  showScreen('auth-screen');
};

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ─────────────── PARTICLES ───────────────
function spawnParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 12 + 8) + 's';
    p.style.animationDelay = (Math.random() * 12) + 's';
    p.style.width = p.style.height = (Math.random() * 2 + 1) + 'px';
    p.style.opacity = Math.random() * 0.5 + 0.1;
    container.appendChild(p);
  }
}

// ─────────────── AUTH ───────────────
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'register' && i === 1));
  });
  document.getElementById('login-form').classList.toggle('active', tab === 'login');
  document.getElementById('register-form').classList.toggle('active', tab === 'register');
}

function populateSectorSelects() {
  ['login-sector', 'reg-sector'].forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = '<option value="">Selecione seu setor</option>';
    state.sectors.forEach(s => {
      sel.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });
  });
}

function login() {
  const name = document.getElementById('login-name').value.trim();
  const pass = document.getElementById('login-pass').value;
  const sector = document.getElementById('login-sector').value;
  const err = document.getElementById('login-error');

  if (!name || !pass || !sector) { err.textContent = 'Preencha todos os campos.'; return; }

  const user = state.users.find(u =>
    u.name.toLowerCase() === name.toLowerCase() &&
    u.password === pass &&
    u.sector === sector
  );

  if (!user) { err.textContent = 'Usuário, senha ou setor incorretos.'; return; }
  err.textContent = '';
  loginUser(user);
}

function register() {
  const name = document.getElementById('reg-name').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  const sector = document.getElementById('reg-sector').value;
  const role = document.getElementById('reg-role').value.trim();
  const err = document.getElementById('reg-error');
  const suc = document.getElementById('reg-success');

  err.textContent = ''; suc.textContent = '';

  if (!name || !pass || !sector) { err.textContent = 'Preencha os campos obrigatórios.'; return; }
  if (pass !== pass2) { err.textContent = 'As senhas não conferem.'; return; }
  if (pass.length < 4) { err.textContent = 'Senha deve ter pelo menos 4 caracteres.'; return; }
  if (state.users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.sector === sector)) {
    err.textContent = 'Já existe um usuário com este nome neste setor.'; return;
  }

  const isAdmin = state.users.length === 0; // primeiro usuário é admin
  const user = {
    id: 'u_' + Date.now(),
    name, password: pass, sector, role: role || 'Colaborador',
    isAdmin, createdAt: new Date().toISOString()
  };

  state.users.push(user);
  save();
  suc.textContent = 'Conta criada com sucesso! Faça login.';
  setTimeout(() => switchTab('login'), 1500);
}

function loginUser(user) {
  state.currentUser = user;
  sessionStorage.setItem('wm_session', user.id);
  setupApp();
  showScreen('app-screen');
}

function logout() {
  state.currentUser = null;
  state.currentChat = null;
  sessionStorage.removeItem('wm_session');
  showScreen('auth-screen');
  populateSectorSelects();
}

// ─────────────── APP SETUP ───────────────
function setupApp() {
  const u = state.currentUser;
  const initials = u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('sidebar-avatar').textContent = initials;
  document.getElementById('sidebar-name').textContent = u.name;
  const sec = state.sectors.find(s => s.id === u.sector);
  document.getElementById('sidebar-sector').textContent = sec ? sec.name : u.sector;

  // Admin tab visibility
  if (u.isAdmin) {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
  }

  renderChatList();
  renderSectorList();
  renderWelcomeStats();
  if (u.isAdmin) renderAdminPanel();
}

function switchSideTab(tab, btn) {
  document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.side-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  if (tab === 'admin') renderAdminPanel();
}

// ─────────────── CHAT LIST ───────────────
function getChatKey(type, id) {
  if (type === 'sector') return 'sector_' + id;
  // DM: sorted IDs
  const ids = [state.currentUser.id, id].sort();
  return 'dm_' + ids.join('_');
}

function getMessages(key) {
  return state.messages[key] || [];
}

function renderChatList() {
  const list = document.getElementById('chat-list');
  const query = (document.getElementById('search-input')?.value || '').toLowerCase();

  // Build items: sectors + dm contacts
  let items = [];

  // Sector chats
  state.sectors.forEach(s => {
    const key = getChatKey('sector', s.id);
    const msgs = getMessages(key);
    const last = msgs[msgs.length - 1];
    items.push({
      type: 'sector', id: s.id, name: s.name,
      icon: s.icon, color: s.color,
      lastMsg: last ? last.text : 'Nenhuma mensagem',
      lastTime: last ? last.time : '',
      key
    });
  });

  // DM chats (only those with messages)
  state.users.forEach(u => {
    if (u.id === state.currentUser.id) return;
    const key = getChatKey('dm', u.id);
    const msgs = getMessages(key);
    if (msgs.length === 0) return;
    const last = msgs[msgs.length - 1];
    items.push({
      type: 'dm', id: u.id, name: u.name,
      icon: null, color: '#00d4ff',
      lastMsg: last.text, lastTime: last.time, key
    });
  });

  if (query) items = items.filter(i => i.name.toLowerCase().includes(query));

  // Sort by last message time
  items.sort((a, b) => (b.lastTime || '').localeCompare(a.lastTime || ''));

  if (items.length === 0) {
    list.innerHTML = '<div class="empty-state"><i class="fa fa-comment-slash"></i>Nenhuma conversa</div>';
    return;
  }

  list.innerHTML = items.map(item => {
    const isActive = state.currentChat && state.currentChat.id === item.id;
    const unread = state.unread[item.key] || 0;
    const timeStr = item.lastTime ? formatTime(item.lastTime) : '';
    const avatarHTML = item.type === 'sector'
      ? `<div class="chat-item-avatar sector" style="color:${item.color}; border-color:${item.color}30; background:${item.color}15"><i class="fa ${item.icon}"></i></div>`
      : `<div class="chat-item-avatar" style="background:linear-gradient(135deg,${item.color},#006699); color:#000; font-family:var(--font-head); font-weight:700">${item.name[0].toUpperCase()}</div>`;

    return `
    <div class="chat-item${isActive ? ' active' : ''}" onclick="openChat('${item.type}','${item.id}')">
      ${avatarHTML}
      <div class="chat-item-info">
        <div class="chat-item-name">${item.name}</div>
        <div class="chat-item-preview">${item.lastMsg.slice(0, 40)}</div>
      </div>
      <div class="chat-item-meta">
        <div class="chat-item-time">${timeStr}</div>
        ${unread ? `<div class="unread-badge">${unread}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function filterChats() { renderChatList(); }

// ─────────────── SECTORS ───────────────
function renderSectorList() {
  const list = document.getElementById('sector-list');
  list.innerHTML = state.sectors.map(s => {
    const members = state.users.filter(u => u.sector === s.id).length;
    return `
    <div class="sector-card" onclick="openChat('sector','${s.id}')">
      <div class="sector-icon" style="background:${s.color}20; color:${s.color}">
        <i class="fa ${s.icon}"></i>
      </div>
      <div class="sector-info">
        <div class="sector-name">${s.name}</div>
        <div class="sector-members"><i class="fa fa-users" style="font-size:10px"></i> ${members} membro${members !== 1 ? 's' : ''}</div>
      </div>
      <div class="sector-arrow"><i class="fa fa-chevron-right"></i></div>
    </div>`;
  }).join('') || '<div class="empty-state"><i class="fa fa-building"></i>Nenhum setor</div>';
}

// ─────────────── OPEN CHAT ───────────────
function openChat(type, id) {
  state.currentChat = { type, id };
  const key = getChatKey(type, id);
  state.unread[key] = 0;

  document.getElementById('welcome-screen').style.display = 'none';
  document.getElementById('active-chat').style.display = 'flex';

  // Header
  if (type === 'sector') {
    const sec = state.sectors.find(s => s.id === id);
    const members = state.users.filter(u => u.sector === id).length;
    document.getElementById('chat-avatar').innerHTML = `<i class="fa ${sec.icon}"></i>`;
    document.getElementById('chat-avatar').className = 'chat-avatar sector-avatar';
    document.getElementById('chat-avatar').style.background = sec.color + '20';
    document.getElementById('chat-avatar').style.color = sec.color;
    document.getElementById('chat-title').textContent = sec.name;
    document.getElementById('chat-subtitle').textContent = `${members} membro${members !== 1 ? 's' : ''} · Canal do setor`;
  } else {
    const user = state.users.find(u => u.id === id);
    const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('chat-avatar').innerHTML = initials;
    document.getElementById('chat-avatar').className = 'chat-avatar';
    document.getElementById('chat-avatar').style.background = 'linear-gradient(135deg,#00d4ff,#006699)';
    document.getElementById('chat-avatar').style.color = '#000';
    document.getElementById('chat-title').textContent = user.name;
    const sec = state.sectors.find(s => s.id === user.sector);
    document.getElementById('chat-subtitle').textContent = `${user.role} · ${sec ? sec.name : user.sector}`;
  }

  renderMessages(key);
  renderChatList();
  document.getElementById('msg-input').focus();
}

// ─────────────── MESSAGES ───────────────
function renderMessages(key) {
  const msgs = getMessages(key);
  const inner = document.getElementById('messages-inner');

  if (msgs.length === 0) {
    inner.innerHTML = '<div class="empty-state"><i class="fa fa-comment-dots"></i>Seja o primeiro a enviar uma mensagem!</div>';
    return;
  }

  let html = '';
  let lastDate = '';

  msgs.forEach(msg => {
    const msgDate = msg.time.split('T')[0];
    if (msgDate !== lastDate) {
      html += `<div class="date-separator">${formatDate(msg.time)}</div>`;
      lastDate = msgDate;
    }

    const isOwn = msg.userId === state.currentUser.id;
    const user = state.users.find(u => u.id === msg.userId) || { name: 'Desconhecido' };
    const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    html += `
    <div class="msg-wrapper${isOwn ? ' own' : ''}">
      ${!isOwn ? `<div class="msg-avatar-small">${initials}</div>` : ''}
      <div>
        ${!isOwn ? `<div class="msg-sender" style="color:var(--accent); font-size:11px; margin-left:2px">${user.name}</div>` : ''}
        <div class="msg-bubble${isOwn ? ' own' : ' other'}">
          ${escapeHTML(msg.text)}
          <div class="msg-time">${formatTime(msg.time)}</div>
        </div>
      </div>
    </div>`;
  });

  inner.innerHTML = html;

  // Scroll to bottom
  const area = document.getElementById('messages-area');
  area.scrollTop = area.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text || !state.currentChat) return;

  const key = getChatKey(state.currentChat.type, state.currentChat.id);
  if (!state.messages[key]) state.messages[key] = [];

  state.messages[key].push({
    id: 'm_' + Date.now(),
    userId: state.currentUser.id,
    text, time: new Date().toISOString()
  });

  save();
  input.value = '';
  input.style.height = 'auto';
  renderMessages(key);
  renderChatList();
  closeEmoji();
}

function clearChat() {
  if (!state.currentChat) return;
  const u = state.currentUser;
  if (!u.isAdmin) { alert('Apenas administradores podem limpar o histórico.'); return; }
  if (!confirm('Apagar todo o histórico desta conversa?')) return;
  const key = getChatKey(state.currentChat.type, state.currentChat.id);
  state.messages[key] = [];
  save();
  renderMessages(key);
  renderChatList();
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// ─────────────── EMOJI ───────────────
const EMOJIS = ['😀','😂','🤣','😊','😍','🥰','😎','🤔','😅','😭','😤','🥳','👍','👎','❤️','🔥','✅','⭐','💡','📌','📎','📊','📱','💬','🙌','💪','🤝','👏','🎯','🚀','⚡','💰','📈','📉','🏆','✨','🎉','🙏','👋','😴','🤦','🤷','💼','🔔','⚠️','❌','✔️','🔑','📧','📞'];

function toggleEmoji() {
  const panel = document.getElementById('emoji-panel');
  panel.classList.toggle('open');
  if (panel.classList.contains('open') && !document.getElementById('emoji-grid').children.length) {
    document.getElementById('emoji-grid').innerHTML = EMOJIS.map(e =>
      `<button class="emoji-btn" onclick="insertEmoji('${e}')">${e}</button>`
    ).join('');
  }
}

function closeEmoji() { document.getElementById('emoji-panel').classList.remove('open'); }
function insertEmoji(e) {
  const input = document.getElementById('msg-input');
  input.value += e;
  input.focus();
}

document.addEventListener('click', e => {
  if (!e.target.closest('.input-toolbar') && !e.target.closest('.emoji-panel')) closeEmoji();
});

// ─────────────── ADMIN ───────────────
function createSector() {
  const name = document.getElementById('new-sector-name').value.trim();
  const color = document.getElementById('new-sector-color').value;
  const icon = document.getElementById('new-sector-icon').value;
  if (!name) { alert('Digite o nome do setor.'); return; }
  const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  if (state.sectors.find(s => s.id === id)) { alert('Já existe um setor com este nome.'); return; }
  state.sectors.push({ id, name, icon, color });
  save();
  document.getElementById('new-sector-name').value = '';
  renderSectorList();
  renderAdminPanel();
  populateSectorSelects();
  alert('Setor criado com sucesso!');
}

function deleteSector(id) {
  if (id === 'geral') { alert('O setor Geral não pode ser removido.'); return; }
  if (!confirm('Remover este setor?')) return;
  state.sectors = state.sectors.filter(s => s.id !== id);
  save();
  renderSectorList();
  renderAdminPanel();
  populateSectorSelects();
}

function renderAdminPanel() {
  // Users
  const userList = document.getElementById('user-list-admin');
  document.getElementById('user-count').textContent = state.users.length;
  userList.innerHTML = state.users.map(u => {
    const sec = state.sectors.find(s => s.id === u.sector);
    const initials = u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return `
    <div class="user-admin-item">
      <div class="user-admin-avatar">${initials}</div>
      <div class="user-admin-info">
        <div class="name">${u.name} ${u.isAdmin ? '<span style="color:var(--accent);font-size:10px">[Admin]</span>' : ''}</div>
        <div class="sector">${sec ? sec.name : u.sector} · ${u.role}</div>
      </div>
      ${!u.isAdmin ? `<button class="del-btn" onclick="deleteUser('${u.id}')" title="Remover"><i class="fa fa-times"></i></button>` : ''}
    </div>`;
  }).join('') || '<div class="empty-state" style="padding:16px">Nenhum usuário</div>';

  // Sectors
  const secList = document.getElementById('sector-list-admin');
  document.getElementById('sector-count').textContent = state.sectors.length;
  secList.innerHTML = state.sectors.map(s => `
    <div class="sector-admin-item">
      <div class="sector-admin-icon" style="background:${s.color}20; color:${s.color}"><i class="fa ${s.icon}"></i></div>
      <div class="sector-admin-info"><div class="name">${s.name}</div></div>
      ${s.id !== 'geral' ? `<button class="del-btn" onclick="deleteSector('${s.id}')" title="Remover"><i class="fa fa-times"></i></button>` : ''}
    </div>`).join('');
}

function deleteUser(id) {
  if (!confirm('Remover este usuário?')) return;
  state.users = state.users.filter(u => u.id !== id);
  save();
  renderAdminPanel();
}

// ─────────────── WELCOME STATS ───────────────
function renderWelcomeStats() {
  const el = document.getElementById('welcome-stats');
  el.innerHTML = `
    <div class="stat-item"><div class="stat-num">${state.sectors.length}</div><div class="stat-label">Setores</div></div>
    <div class="stat-item"><div class="stat-num">${state.users.length}</div><div class="stat-label">Usuários</div></div>
    <div class="stat-item"><div class="stat-num">${Object.values(state.messages).reduce((acc, m) => acc + m.length, 0)}</div><div class="stat-label">Mensagens</div></div>
  `;
}

// ─────────────── HELPERS ───────────────
function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
}

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'agora';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'min';
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Hoje';
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Auto-refresh every 5s (simulating real-time for multi-user via shared localStorage)
setInterval(() => {
  if (!state.currentUser) return;
  load();
  if (state.currentChat) {
    const key = getChatKey(state.currentChat.type, state.currentChat.id);
    renderMessages(key);
  }
  renderChatList();
  renderWelcomeStats();
}, 5000);
