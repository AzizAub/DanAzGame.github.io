const WebSocket = require('ws');

// Создаём WebSocket-сервер на порту 3000
const server = new WebSocket.Server({ port: 3000 });

let players = []; // Массив для хранения подключённых игроков

// Обработка подключения новых игроков
server.on('connection', (socket) => {
  players.push(socket);
  console.log('A new player has connected!');

  // Если подключены два игрока, отправляем сообщение о начале игры
  if (players.length === 2) {
    players[0].send(JSON.stringify({ type: 'start', color: 'white' }));
    players[1].send(JSON.stringify({ type: 'start', color: 'black' }));
  }

  // Обработка сообщений от клиента
  socket.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'move') {
      // Определяем другого игрока и отправляем ему данные о ходе
      const opponent = players.find((player) => player !== socket);
      if (opponent) {
        opponent.send(JSON.stringify(data));
      }
    }
  });

  // Обработка отключения игрока
  socket.on('close', () => {
    console.log('A player has disconnected');
    players = players.filter((player) => player !== socket);
  });
});

console.log('WebSocket server is running on ws://localhost:3000');
