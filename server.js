// server.js - ПРОСТАЯ ВЕРСИЯ БЕЗ ВЫБОРА ЧАТОВ
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const MESSAGES_FILE = 'messages.json';

function loadMessages() {
    try {
        if (fs.existsSync(MESSAGES_FILE)) {
            return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
        }
    } catch (e) {}
    return [];
}

function saveMessage(message) {
    const messages = loadMessages();
    messages.push(message);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// ВСЕ сообщения в одном общем чате
let onlineUsers = [];

io.on('connection', (socket) => {
    console.log('Пользователь подключился:', socket.id);

    socket.on('user join', (username) => {
        socket.username = username;
        
        // Добавляем в онлайн
        if (!onlineUsers.includes(username)) {
            onlineUsers.push(username);
        }
        
        console.log('✅ Пользователь в чате:', username);
        
        // Отправляем историю сообщений
        const messages = loadMessages();
        socket.emit('chat history', messages);
        
        // Отправляем список онлайн
        io.emit('online users', onlineUsers);
    });

    socket.on('send message', (text) => {
        const from = socket.username;
        
        if (!from) return;

        const message = {
            id: Date.now(),
            from: from,
            text: text,
            timestamp: new Date().toLocaleTimeString(),
            to: 'all' // ВСЕМ В ОБЩЕМ ЧАТЕ
        };

        saveMessage(message);
        
        console.log('💬', from, ':', text);

        // ОТПРАВЛЯЕМ ВСЕМ В ЧАТЕ
        io.emit('new message', message);
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            onlineUsers = onlineUsers.filter(user => user !== socket.username);
            io.emit('online users', onlineUsers);
            console.log('❌ Пользователь вышел:', socket.username);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('🚀 Общий чат запущен на порту 3000');
});