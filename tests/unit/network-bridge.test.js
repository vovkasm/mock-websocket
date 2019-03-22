import 'jest'

import networkBridge from '../../src/network-bridge';

const fakeObject = { foo: 'bar' };

beforeEach(() => {
  networkBridge.urlMap = {};
});

test('that network bridge has no connections be defualt', () => {
  expect(networkBridge.urlMap).toEqual({})
});

test('that network bridge has no connections be defualt', () => {
  const result = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');

  expect(result).toBeFalsy()
  expect(networkBridge.urlMap).toEqual({})
});

test('that attachServer adds a server to url map', () => {
  const result = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  const connection = networkBridge.urlMap['ws://localhost:8080'];

  expect(result).toEqual(fakeObject)
  expect(connection.server).toEqual(fakeObject)
  expect(connection.websockets).toHaveLength(0)
});

test('that attachServer does nothing if a server is already attached to a given url', () => {
  const result = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  const result2 = networkBridge.attachServer({ hello: 'world' }, 'ws://localhost:8080');
  const connection = networkBridge.urlMap['ws://localhost:8080'];

  expect(result).toEqual(fakeObject)
  expect(result2).toBeFalsy()
  expect(connection.server).toEqual(fakeObject)
});

test('that attachWebSocket will add a websocket to the url map', () => {
  const resultServer = networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  const resultWebSocket = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');
  const connection = networkBridge.urlMap['ws://localhost:8080'];

  expect(resultServer).toBe(fakeObject)
  expect(resultWebSocket).toBe(fakeObject)
  expect(connection.websockets).toEqual([fakeObject])
});

test('that attachWebSocket will add the same websocket only once', () => {
  networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');
  const resultWebSocket2 = networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');
  const connection = networkBridge.urlMap['ws://localhost:8080'];

  expect(resultWebSocket2).toBeFalsy()
  expect(connection.websockets).toEqual([fakeObject])
});

test('that server and websocket lookups return the correct objects', () => {
  networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');

  const serverLookup = networkBridge.serverLookup('ws://localhost:8080');
  const websocketLookup = networkBridge.websocketsLookup('ws://localhost:8080');

  expect(serverLookup).toBe(fakeObject);
  expect(websocketLookup).toEqual([fakeObject])
});

test('that removing server and websockets works correctly', () => {
  networkBridge.attachServer(fakeObject, 'ws://localhost:8080');
  networkBridge.attachWebSocket(fakeObject, 'ws://localhost:8080');

  let websocketLookup = networkBridge.websocketsLookup('ws://localhost:8080');
  expect(websocketLookup).toHaveLength(1)

  networkBridge.removeWebSocket(fakeObject, 'ws://localhost:8080');

  websocketLookup = networkBridge.websocketsLookup('ws://localhost:8080');
  expect(websocketLookup).toHaveLength(0)

  networkBridge.removeServer('ws://localhost:8080');
  expect(networkBridge.urlMap).toEqual({})
});
