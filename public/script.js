let currentUser = 'User'; // временное значение

const socket = io();
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');

// Получаем наше имя от сервера
socket.on('user assigned', (userName) => {
    currentUser = userName;
    console.log('Вы вошли как:', currentUser);
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('send message', {
            text: message,
            sender: currentUser, // ← Используем уникальное имя!
            timestamp: new Date().toLocaleTimeString()
        });
        messageInput.value = '';
    }
}

// Остальной код остается таким же...
socket.on('message history', (history) => {
    chatMessages.innerHTML = '';
    history.forEach(message => {
        addMessageToChat(message);
    });
});

socket.on('new message', (message) => {
    addMessageToChat(message);
});

function addMessageToChat(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    // Теперь сравниваем с currentUser
    if (message.sender === currentUser) {
        messageElement.classList.add('sent'); // мои сообщения справа
    } else {
        messageElement.classList.add('received'); // чужие сообщения слева
    }
    
    messageElement.innerHTML = `
        <div class="message-sender">${message.sender}</div>
        <div class="message-text">${message.text}</div>
        <div class="message-time">${message.timestamp}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showSystemMessage(text) {
    const systemElement = document.createElement('div');
    systemElement.classList.add('system-message');
    systemElement.textContent = text;
    
    chatMessages.appendChild(systemElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
// Переключение тем
function switchTheme() {
    const body = document.body;
    const themeSwitcher = document.querySelector('.theme-switcher');
    
    // Добавляем анимацию перехода
    body.classList.add('theme-transition');
    
    if (body.classList.contains('theme-dark')) {
        body.classList.replace('theme-dark', 'theme-light');
        themeSwitcher.textContent = '☀️ Светлая';
    } else if (body.classList.contains('theme-light')) {
        body.classList.replace('theme-light', 'theme-neon');
        themeSwitcher.textContent = '🌠 Неоновая';
    } else {
        body.classList.replace('theme-neon', 'theme-dark');
        themeSwitcher.textContent = '🌙 Тёмная';
    }
    
    // Убираем класс анимации после завершения
    setTimeout(() => {
        body.classList.remove('theme-transition');
    }, 500);
}