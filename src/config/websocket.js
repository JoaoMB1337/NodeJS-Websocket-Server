const WebSocket = require('ws');
const url = require('url');

const rooms = new Map();
module.exports = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        const parameters = url.parse(req.url, true).query;
        const room = parameters.room;
        const username = parameters.username;
    
        if (!room || !username) {
            ws.close(1008, 'Room and username parameters are required');
            return;
        }
    
        ws.username = username;
        ws.room = room;
    
        if (!rooms.has(room)) {
            rooms.set(room, new Map()); 
        }
        rooms.get(room).set(ws, username);
    
        const broadcastUserList = () => {
            const users = Array.from(rooms.get(room).values());
            const message = JSON.stringify({
                type: 'userList',
                users: users
            });
    
            rooms.get(room).forEach((_, client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        };
    
        // Enviar lista de atletas na sala
        broadcastUserList();
    
        // Quando todos os atletas estiverem na sala, enviar a mensagem para começar a contagem regressiva
        if (rooms.get(room).size > 1) { // Quando pelo menos 1 outro usuário entrou na sala
            const startMessage = JSON.stringify({
                type: 'startCountdown',
                countdownTime: 10 // Exemplo: 10 segundos de contagem regressiva
            });
            rooms.get(room).forEach((_, client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(startMessage);
                }
            });
        }
    
        // Manipular mensagens recebidas do cliente
        ws.on('message', (message) => {
            const data = JSON.parse(message);
    
            // Caso os dados de treino sejam enviados (timestamp, velocidade, etc.)
            if (data.type === 'trainingData') {
                // Aqui você pode processar ou transmitir os dados de treino
                const trainingMessage = JSON.stringify({
                    type: 'trainingData',
                    username: ws.username,
                    timestamp: data.timestamp,
                    speed: data.speed,
                    distance: data.distance,
                    spm: data.spm,
                    watts: data.watts
                });
    
                // Enviar os dados para todos os atletas na sala
                rooms.get(room).forEach((_, client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(trainingMessage);
                    }
                });
            }
        });
    
        // Remover o usuário da sala quando desconectar
        ws.on('close', () => {
            rooms.get(room).delete(ws);
            if (rooms.get(room).size === 0) {
                rooms.delete(room);
            } else {
                broadcastUserList();
            }
        });
    });
};