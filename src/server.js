require('dotenv').config();
const http = require('http');
const app = require('./app');
const websocket = require('./config/websocket');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

websocket(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
