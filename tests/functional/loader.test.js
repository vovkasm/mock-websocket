import test from 'ava';
import systemjs from 'systemjs';

test('amd modules are loaded', async t => {
  const mockSocket = await systemjs.import('./dist/mock-websocket.amd.js');

  t.truthy(mockSocket.Server);
  t.truthy(mockSocket.WebSocket);
});

test('umd modules are loaded', async t => {
  const mockSocket = await systemjs.import('./dist/mock-websocket.js');

  t.truthy(mockSocket.Server);
  t.truthy(mockSocket.WebSocket);
});

test('cjs modules are loaded', async t => {
  const mockSocket = await systemjs.import('./dist/mock-websocket.cjs.js');

  t.truthy(mockSocket.Server);
  t.truthy(mockSocket.WebSocket);
});

// TODO: install traceur (https://github.com/systemjs/plugin-traceur)
test.skip('es modules are loaded', async t => {
  const mockSocket = await systemjs.import('./dist/mock-websocket.es.js');

  t.truthy(mockSocket.Server);
  t.truthy(mockSocket.WebSocket);
});
