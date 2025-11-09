// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Раздаем статические файлы из папки 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Временное хранилище сообщений
let messages = [];
let userCount = 0; // ← ДОБАВЬТЕ ЭТУ СТРОЧКУ!

// Обрабатываем подключение клиента
io.on('connection', (socket) => {
  userCount++;
  const userName = `User${userCount}`;
  
  console.log('Новый пользователь подключился:', socket.id, 'как', userName);

  // Отправляем историю сообщений новому пользователю
  socket.emit('message history', messages);
  
  // Отправляем имя пользователя
  socket.emit('user assigned', userName);

  // Слушаем новое сообщение от клиента
  socket.on('send message', (data) => {
    console.log('Получено сообщение от', userName, ':', data.text);
    const messageWithId = { 
      ...data, 
      id: Date.now(),
      sender: userName // Используем уникальное имя
    };
    messages.push(messageWithId);
    
    // Рассылаем сообщение всем подключенным клиентам
    io.emit('new message', messageWithId);
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', userName);
    userCount--;
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});