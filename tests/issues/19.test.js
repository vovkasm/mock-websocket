import 'jest'

import Server from '../../src/server';
import WebSocket from '../../src/websocket';

test('that server on(message) argument should be a string and not an object', (done) => {
  const socketUrl = 'ws://localhost:8080';
  const mockServer = new Server(socketUrl);
  const mockSocket = new WebSocket(socketUrl);

  mockServer.on('connection', socket => {
    socket.on('message', message => {
      expect(typeof message).toBe('string')
      mockServer.close();
      done()
    });
  });

  mockSocket.onopen = function open() {
    this.send('1');
  };
});
