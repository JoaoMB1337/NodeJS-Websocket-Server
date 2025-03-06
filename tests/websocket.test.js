const WebSocket = require('ws');
const http = require('http');
const websocketServer = require('../src/config/websocket');

describe('WebSocket Server', () => {
  let server;
  let wss;

  beforeAll((done) => {
    server = http.createServer();
    wss = websocketServer(server);
    server.listen(0, () => done());
  });

  afterAll((done) => {
    server.close(done);
  });

  test('deve fechar conexão sem room ou username', (done) => {
    const ws = new WebSocket(`ws://localhost:${server.address().port}`);
    ws.on('close', (code, reason) => {
      expect(code).toBe(1008);
      expect(reason.toString()).toBe('Room and username parameters are required');
      done();
    });
  });

  test('deve listar usuários na sala', (done) => {
    const ws1 = new WebSocket(`ws://localhost:${server.address().port}?room=testeRoom&username=Alice`);
    const ws2 = new WebSocket(`ws://localhost:${server.address().port}?room=testeRoom&username=Bob`);

    ws2.on('message', (message) => {
      const data = JSON.parse(message);
      if (data.type === 'userList') {
        expect(data.users).toContain('Alice');
        expect(data.users).toContain('Bob');
        ws1.close();
        ws2.close();
        done();
      }
    });
  });

});