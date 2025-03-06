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

        broadcastUserList();

        ws.on('message', (message) => {
            if (typeof message !== 'string' || message.length > 500) {
                ws.close(1009, 'Invalid or too long message');
                return;
            }

            // Enviar mensagem para todos na sala com o nome do remetente
            const formattedMessage = JSON.stringify({
                type: 'message',
                username: username,
                content: message
            });

            rooms.get(room).forEach((_, client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(formattedMessage);
                }
            });
        });

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