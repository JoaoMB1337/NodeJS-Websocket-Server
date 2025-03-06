const WebSocket = require('ws');

// Simula dois clientes se conectando à mesma sala
const room = 'testRoom';

// Cliente 1
const ws1 = new WebSocket(`ws://localhost:3000?room=${room}`);

ws1.on('open', () => {
    console.log('Cliente 1 conectado');
    ws1.send('Olá do Cliente 1!');
});

ws1.on('message', (message) => {
    console.log('Cliente 1 recebeu:', message);
});

ws1.on('error', (err) => {
    console.error('Erro no Cliente 1:', err);
});

// Cliente 2
const ws2 = new WebSocket(`ws://localhost:3000?room=${room}`);

ws2.on('open', () => {
    console.log('Cliente 2 conectado');
    ws2.send('Olá do Cliente 2!');
});

ws2.on('message', (message) => {
    console.log('Cliente 2 recebeu:', message);
});

ws2.on('error', (err) => {
    console.error('Erro no Cliente 2:', err);
});