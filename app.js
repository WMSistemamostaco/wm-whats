// WM Whats Empresa - Sistema de Comunicação Interna
// Versão 2.0

// ==================== CONFIGURAÇÃO INICIAL ====================
let currentUser = null;
let currentChat = null;
let currentChatType = null; // 'sector' or 'private'
let messages = {};
let sectors = [];
let users = [];
let unreadCounts = {};

// Emojis padrão
const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    loadSectors();
    setupEventListeners();
    generateEmojiGrid();
    initParticleCanvas();
    
    // Verificar se há usuário logado
    const savedUser = localStorage.getItem('wm_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
    } else {
        setTimeout(() => {
            document.getElementById('splash-screen').style.display = 'none';
            document.getElementById('auth-screen').classList.add('active');
        }, 2500);
    }
});

function initializeData() {
    // Carregar setores padrão
    const savedSectors = localStorage.getItem('wm_sectors');
    if (savedSectors) {
        sectors = JSON.parse(savedSectors);
    } else {
        sectors = [
            { id: 'geral', name: 'Geral', color: '#00d4ff', icon: 'fa-building', description: 'Comunicação geral da empresa' },
            { id: 'rh', name: 'RH', color: '#00ff88', icon: 'fa-users', description: 'Recursos Humanos' },
            { id: 'ti', name: 'TI', color: '#a855f7', icon: 'fa-code', description: 'Tecnologia da Informação' },
            { id: 'vendas', name: 'Vendas', color: '#ff6b35', icon: 'fa-chart-line', description: 'Equipe Comercial' },
            { id: 'marketing', name: 'Marketing', color: '#ff3366', icon: 'fa-bullhorn', description: 'Marketing Digital' },
            { id: 'financeiro', name: 'Financeiro', color: '#ffd700', icon: 'fa-dollar-sign', description: 'Finanças e Contabilidade' }
        ];
        localStorage.setItem('wm_sectors', JSON.stringify(sectors));
    }
    
    // Carregar usuários
    const savedUsers = localStorage.getItem('wm_users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    } else {
        users = [];
        localStorage.setItem('wm_users', JSON.stringify(users));
    }
    
    // Carregar mensagens
    const savedMessages = localStorage.getItem('wm_messages');
    if (savedMessages) {
        messages = JSON.parse(savedMessages);
    } else {
        messages = {};
        sectors.forEach(sector => {
            messages[`sector_${sector.id}`] = [];
        });
        localStorage.setItem('wm_messages', JSON.stringify(messages));
    }
    
    // Carregar contadores de não lidas
    const savedUnread = localStorage.getItem('wm_unread');
    if (savedUnread) {
        unreadCounts = JSON.parse(savedUnread);
    } else {
        unreadCounts = {};
        localStorage.setItem('wm_unread', JSON.stringify(unreadCounts));
    }
}

function loadSectors() {
    const loginSelect = document.getElementById('login-sector');
    const regSelect = document.getElementById('reg-sector');
    
    loginSelect.innerHTML = '<option value="">Selecione seu setor</option>';
    regSelect.innerHTML = '<option value="">Selecione seu setor</option>';
    
    sectors.forEach(sector => {
        loginSelect.innerHTML += `<option value="${sector.id}">${sector.name}</option>`;
        regSelect.innerHTML += `<option value="${sector.id}">${sector.name}</option>`;
    });
}

function setupEventListeners() {
    // Tabs de autenticação
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchAuthTab(tabName);
        });
    });
    
    // Enter para enviar mensagem
    document.getElementById('msg-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Fechar emoji panel ao clicar fora
    document.addEventListener('click', (e) => {
        const emojiPanel = document.getElementById('emoji-panel');
        const emojiBtn = document.querySelector('.btn-emoji');
        if (emojiPanel && !emojiPanel.contains(e.target) && !emojiBtn?.contains(e.target)) {
            emojiPanel.style.display = 'none';
        }
    });
}

function switchAuthTab(tabName) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.auth-tab[data-tab="${tabName}"]`).classList.add('active');
    
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(`${tabName}-form`).classList.add('active');
}

function initParticleCanvas() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
        
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ==================== AUTENTICAÇÃO ====================
function login() {
    const name = document.getElementById('login-name').value.trim();
    const password = document.getElementById('login-pass').value;
    const sectorId = document.getElementById('login-sector').value;
    
    if (!name || !password || !sectorId) {
        showError('login-error', 'Preencha todos os campos');
        return;
    }
    
    const user = users.find(u => u.name === name && u.password === password && u.sector === sectorId);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('wm_current_user', JSON.stringify(user));
        showApp();
    } else {
        showError('login-error', 'Usuário ou senha inválidos');
    }
}

function register() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-pass').value;
    const password2 = document.getElementById('reg-pass2').value;
    const sectorId = document.getElementById('reg-sector').value;
    const role = document.getElementById('reg-role').value.trim();
    
    if (!name || !email || !password || !sectorId) {
        showError('reg-error', 'Preencha todos os campos obrigatórios');
        return;
    }
    
    if (password !== password2) {
        showError('reg-error', 'As senhas não coincidem');
        return;
    }
    
    if (users.find(u => u.name === name)) {
        showError('reg-error', 'Este nome de usuário já está em uso');
        return;
    }
    
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        sector: sectorId,
        role: role || 'Colaborador',
        isAdmin: users.length === 0, // Primeiro usuário é admin
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('wm_users', JSON.stringify(users));
    
    showSuccess('reg-success', 'Conta criada com sucesso! Faça login.');
    setTimeout(() => {
        switchAuthTab('login');
        document.getElementById('reg-error').textContent = '';
        document.getElementById('reg-success').textContent = '';
    }, 2000);
}

function showApp() {
    document.getElementById('splash-screen').style.display = 'none';
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    
    // Atualizar UI
    document.getElementById('sidebar-name').textContent = currentUser.name;
    document.getElementById('sidebar-sector').textContent = sectors.find(s => s.id === currentUser.sector)?.name || 'Setor';
    document.getElementById('sidebar-avatar').innerHTML = `<div class="avatar-initials">${currentUser.name.charAt(0).toUpperCase()}</div>`;
    
    // Mostrar admin se for admin
    if (currentUser.isAdmin) {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
    }
    
    loadChats();
    loadSectorList();
    loadWelcomeStats();
    loadUserListAdmin();
    loadSectorListAdmin();
}

function logout() {
    localStorage.removeItem('wm_current_user');
    currentUser = null;
    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('login-name').value = '';
    document.getElementById('login-pass').value = '';
}

// ==================== CHAT FUNCTIONS ====================
function loadChats() {
    const chatList = document.getElementById('chat-list');
    chatList.innerHTML = '';
    
    // Adicionar setores como chats
    sectors.forEach(sector => {
        const chatId = `sector_${sector.id}`;
        const lastMessage = messages[chatId]?.[messages[chatId].length - 1];
        const unread = unreadCounts[chatId] || 0;
        
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.onclick = () => openChat('sector', sector.id);
        chatItem.innerHTML = `
            <div class="chat-avatar" style="background: ${sector.color}">
                <i class="fas ${sector.icon}"></i>
            </div>
            <div class="chat-info">
                <div class="chat-name">${sector.name}</div>
                <div class="chat-preview">${lastMessage ? (lastMessage.sender + ': ' + lastMessage.text.substring(0, 30)) : 'Nenhuma mensagem'}</div>
            </div>
            ${unread > 0 ? `<div class="chat-badge">${unread > 99 ? '99+' : unread}</div>` : ''}
        `;
        chatList.appendChild(chatItem);
    });
    
    // Atualizar badge de chats
    const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
    document.getElementById('chat-badge').textContent = totalUnread;
    document.getElementById('chat-badge').style.display = totalUnread > 0 ? 'inline-block' : 'none';
}

function loadSectorList() {
    const sectorList = document.getElementById('sector-list');
    sectorList.innerHTML = '';
    
    sectors.forEach(sector => {
        const sectorItem = document.createElement('div');
        sectorItem.className = 'sector-item';
        sectorItem.onclick = () => openChat('sector', sector.id);
        sectorItem.innerHTML = `
            <div class="sector-avatar" style="background: ${sector.color}">
                <i class="fas ${sector.icon}"></i>
            </div>
            <div class="sector-info">
                <div class="sector-name">${sector.name}</div>
                <div class="sector-desc">${sector.description || 'Setor da empresa'}</div>
            </div>
            <i class="fas fa-chevron-right"></i>
        `;
        sectorList.appendChild(sectorItem);
    });
}

function openChat(type, id) {
    currentChat = id;
    currentChatType = type;
    
    // Resetar unread count
    const chatKey = `${type}_${id}`;
    if (unreadCounts[chatKey]) {
        unreadCounts[chatKey] = 0;
        localStorage.setItem('wm_unread', JSON.stringify(unreadCounts));
        loadChats();
    }
    
    // Atualizar UI
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('active-chat').style.display = 'flex';
    
    // Atualizar header
    let title = '', subtitle = '', avatar = '';
    if (type === 'sector') {
        const sector = sectors.find(s => s.id === id);
        title = sector.name;
        subtitle = sector.description || 'Setor da empresa';
        avatar = `<i class="fas ${sector.icon}"></i>`;
    }
    
    document.getElementById('chat-title').textContent = title;
    document.getElementById('chat-subtitle').innerHTML = subtitle;
    document.getElementById('chat-avatar').innerHTML = avatar;
    
    // Carregar mensagens
    loadMessages();
}

function loadMessages() {
    const chatKey = `${currentChatType}_${currentChat}`;
    const chatMessages = messages[chatKey] || [];
    
    const messagesContainer = document.getElementById('messages-inner');
    messagesContainer.innerHTML = '';
    
    if (chatMessages.length === 0) {
        messagesContainer.innerHTML = '<div class="empty-state"><i class="fas fa-comment"></i><p>Nenhuma mensagem ainda. Seja o primeiro a enviar!</p></div>';
        return;
    }
    
    chatMessages.forEach(msg => {
        const isOwn = msg.senderId === currentUser.id;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwn ? 'message-own' : 'message-other'}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${!isOwn ? `<div class="message-sender">${msg.sender}</div>` : ''}
                <div class="message-text">${escapeHtml(msg.text)}</div>
                <div class="message-time">${formatTime(msg.timestamp)}</div>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
    });
    
    // Scroll para o final
    const messagesArea = document.getElementById('messages-area');
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    const chatKey = `${currentChatType}_${currentChat}`;
    if (!messages[chatKey]) messages[chatKey] = [];
    
    const message = {
        id: Date.now(),
        text,
        sender: currentUser.name,
        senderId: currentUser.id,
        timestamp: new Date().toISOString()
    };
    
    messages[chatKey].push(message);
    localStorage.setItem('wm_messages', JSON.stringify(messages));
    
    input.value = '';
    autoResize(input);
    loadMessages();
    loadChats();
}

function clearChat() {
    if (confirm('Tem certeza que deseja limpar todas as mensagens deste chat?')) {
        const chatKey = `${currentChatType}_${currentChat}`;
        messages[chatKey] = [];
        localStorage.setItem('wm_messages', JSON.stringify(messages));
        loadMessages();
        showToast('Conversa limpa com sucesso!');
    }
}

function exportChat() {
    const chatKey = `${currentChatType}_${currentChat}`;
    const chatMessages = messages[chatKey] || [];
    
    let content = `Exportação de conversa - ${new Date().toLocaleString()}\n`;
    content += `Chat: ${document.getElementById('chat-title').textContent}\n`;
    content += `="========================================="\n\n`;
    
    chatMessages.forEach(msg => {
        content += `[${formatDateTime(msg.timestamp)}] ${msg.sender}: ${msg.text}\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_${currentChat}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Conversa exportada com sucesso!');
}

// ==================== ADMIN FUNCTIONS ====================
function createSector() {
    if (!currentUser?.isAdmin) {
        showToast('Apenas administradores podem criar setores');
        return;
    }
    
    const name = document.getElementById('new-sector-name').value.trim();
    const color = document.getElementById('new-sector-color').value;
    const icon = document.getElementById('new-sector-icon').value;
    
    if (!name) {
        showToast('Digite o nome do setor');
        return;
    }
    
    const newSector = {
        id: name.toLowerCase().replace(/\s/g, '_'),
        name,
        color,
        icon: icon.replace('fa-', ''),
        description: `${name} - Setor da empresa`
    };
    
    sectors.push(newSector);
    localStorage.setItem('wm_sectors', JSON.stringify(sectors));
    
    // Criar espaço para mensagens
    messages[`sector_${newSector.id}`] = [];
    localStorage.setItem('wm_messages', JSON.stringify(messages));
    
    // Recarregar
    loadSectors();
    loadChats();
    loadSectorList();
    loadSectorListAdmin();
    
    document.getElementById('new-sector-name').value = '';
    showToast(`Setor "${name}" criado com sucesso!`);
}

function loadUserListAdmin() {
    const container = document.getElementById('user-list-admin');
    if (!container) return;
    
    container.innerHTML = '';
    users.forEach(user => {
        const sector = sectors.find(s => s.id === user.sector);
        const userItem = document.createElement('div');
        userItem.className = 'admin-user-item';
        userItem.innerHTML = `
            <div class="admin-user-info">
                <div class="admin-user-name">${user.name}</div>
                <div class="admin-user-sector">${sector?.name || 'Setor'} • ${user.role || 'Colaborador'}</div>
            </div>
            ${user.isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
        `;
        container.appendChild(userItem);
    });
    
    document.getElementById('user-count').textContent = users.length;
}

function loadSectorListAdmin() {
    const container = document.getElementById('sector-list-admin');
    if (!container) return;
    
    container.innerHTML = '';
    sectors.forEach(sector => {
        const sectorItem = document.createElement('div');
        sectorItem.className = 'admin-sector-item';
        sectorItem.innerHTML = `
            <div class="admin-sector-info">
                <div class="admin-sector-name">${sector.name}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted)">ID: ${sector.id}</div>
            </div>
            <div style="width: 20px; height: 20px; background: ${sector.color}; border-radius: 4px;"></div>
        `;
        container.appendChild(sectorItem);
    });
    
    document.getElementById('sector-count').textContent = sectors.length;
}

function loadWelcomeStats() {
    const statsContainer = document.getElementById('welcome-stats');
    if (!statsContainer) return;
    
    const totalMessages = Object.values(messages).reduce((sum, arr) => sum + arr.length, 0);
    const totalSectors = sectors.length;
    const totalUsers = users.length;
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="number">${totalMessages}</div>
            <div class="label">Mensagens</div>
        </div>
        <div class="stat-card">
            <div class="number">${totalSectors}</div>
            <div class="label">Setores</div>
        </div>
        <div class="stat-card">
            <div class="number">${totalUsers}</div>
            <div class="label">Usuários</div>
        </div>
    `;
}

// ==================== UI FUNCTIONS ====================
function switchSideTab(tab, element) {
    document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    
    document.querySelectorAll('.side-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
}

function filterChats() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const chatItems = document.querySelectorAll('.chat-item');
    
    chatItems.forEach(item => {
        const name = item.querySelector('.chat-name')?.textContent.toLowerCase() || '';
        item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
    });
}

function toggleEmoji() {
    const panel = document.getElementById('emoji-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function generateEmojiGrid() {
    const grid = document.getElementById('emoji-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    emojis.forEach(emoji => {
        const span = document.createElement('span');
        span.textContent = emoji;
        span.onclick = () => insertEmoji(emoji);
        grid.appendChild(span);
    });
}

function insertEmoji(emoji) {
    const input = document.getElementById('msg-input');
    input.value += emoji;
    autoResize(input);
    document.getElementById('emoji-panel').style.display = 'none';
    input.focus();
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    
    const charCount = textarea.value.length;
    const counter = document.querySelector('.char-counter');
    if (counter) {
        counter.textContent = `${charCount}/500`;
        if (charCount > 450) counter.style.color = 'var(--accent-warning)';
        else if (charCount > 480) counter.style.color = 'var(--accent-danger)';
        else counter.style.color = 'var(--text-muted)';
    }
}

function handleKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const icon = document.querySelector('.header-actions .btn-icon:first-child i');
    if (document.body.classList.contains('light-theme')) {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// ==================== HELPER FUNCTIONS ====================
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    setTimeout(() => { element.textContent = ''; }, 3000);
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    setTimeout(() => { element.textContent = ''; }, 3000);
}

function showToast(message) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
}

// ==================== EXPORTAR FUNÇÕES GLOBAIS ====================
window.login = login;
window.register = register;
window.logout = logout;
window.openChat = openChat;
window.sendMessage = sendMessage;
window.clearChat = clearChat;
window.exportChat = exportChat;
window.createSector = createSector;
window.switchSideTab = switchSideTab;
window.filterChats = filterChats;
window.toggleEmoji = toggleEmoji;
window.insertEmoji = insertEmoji;
window.autoResize = autoResize;
window.handleKey = handleKey;
window.toggleTheme = toggleTheme;
window.togglePassword = togglePassword;
