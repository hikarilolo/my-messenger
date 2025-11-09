// script.js - ПРОСТОЙ ОБЩИЙ ЧАТ
let currentUser = null;
let socket = null;

function joinChat() {
    const username = document.getElementById('username-input').value.trim();
    
    if (!username) {
        alert('Введите ваше имя');
        return;
    }

    currentUser = username;
    
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('chat-screen').style.display = 'flex';
    document.getElementById('current-user').textContent = username;
    
    socket = io();
    socket.emit('user join', username);
    
    socket.on('chat history', showChatHistory);
    socket.on('new message', addMessageToChat);
    socket.on('online users', updateOnlineUsers);
    
    // СРАЗУ АКТИВИРУЕМ ПОЛЕ ВВОДА
    const messageInput = document.getElementById('message-input');
    const sendButton = document.querySelector('.send-button');
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    
    if (text) {
        socket.emit('send message', text);
        input.value = '';
    }
}

function showChatHistory(messages) {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';
    
    messages.forEach(message => {
        addMessageToChat(message);
    });
    
    container.scrollTop = container.scrollHeight;
}

function addMessageToChat(message) {
    const container = document.getElementById('messages-container');
    const messageElement = document.createElement('div');
    
    messageElement.classList.add('message');
    if (message.from === currentUser) {
        messageElement.classList.add('sent');
    } else {
        messageElement.classList.add('received');
    }
    
    messageElement.innerHTML = `
        <div class="message-bubble">
            <div class="message-sender">${message.from}</div>
            <div class="message-text">${message.text}</div>
            <div class="message-time">${message.timestamp}</div>
        </div>
    `;
    
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight;
}

function updateOnlineUsers(users) {
    const onlineCount = document.getElementById('online-count');
    onlineCount.textContent = users.length;
}

// Enter для отправки
document.getElementById('message-input')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
});

document.getElementById('username-input')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') joinChat();
});