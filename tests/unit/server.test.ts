import 'jest'

import globalObject from '../../src/helpers/global-object'
import networkBridge from '../../src/network-bridge'
import Server from '../../src/server'
import WebSocket from '../../src/websocket'

test('that after creating a server it is added to the network bridge', () => {
  const myServer = new Server('ws://not-real/')
  const mapping = networkBridge.urlMap['ws://not-real/']

  expect(mapping.server).toBe(myServer)
  myServer.close()
  expect(networkBridge.urlMap).toEqual({})
})

test('that callback functions can be added to the listeners object', () => {
  const myServer = new Server('ws://not-real/')

  myServer.on('message', jest.fn())
  myServer.on('close', jest.fn())

  expect(myServer.listeners.get('message')).toHaveLength(1)
  expect(myServer.listeners.get('close')).toHaveLength(1)

  myServer.close()
})

test('that calling clients() returns the correct clients', () => {
  const myServer = new Server('ws://not-real/')
  const socketFoo = new WebSocket('ws://not-real/')
  const socketBar = new WebSocket('ws://not-real/')

  expect(myServer.clients()).toEqual([socketFoo, socketBar])

  myServer.close()
})

test('that calling clients() returns the correct clients', () => {
  const myServer = new Server('ws://not-real/')

  myServer.on('connection', (socket: WebSocket) => {
    myServer.send('Testing', { websocket: socket })
  })

  const socketFoo = new WebSocket('ws://not-real/')
  const doneFoo = new Promise((resolve, reject) => {
    socketFoo.onmessage = resolve
  })

  const socketBar = new WebSocket('ws://not-real/')
  const doneBar = new Promise((resolve, reject) => {
    socketBar.onmessage = resolve
  })

  return Promise.all([doneFoo, doneBar]).then(() => {
    myServer.close()
  })
})

test('that calling close will trigger the onclose of websockets', () => {
  const myServer = new Server('ws://not-real/')
  let counter = 0

  myServer.on('connection', () => {
    counter++
    if (counter === 2) {
      myServer.close({
        code: 1005,
        reason: 'Some reason',
      })
    }
  })

  const socketFoo = new WebSocket('ws://not-real/')
  const doneFoo = new Promise((resolve, reject) => {
    socketFoo.onclose = (event) => {
      expect(event.code).toBe(1005)
      expect(event.reason).toBe('Some reason')
      resolve()
    }
  })

  const socketBar = new WebSocket('ws://not-real/')
  const doneBar = new Promise((resolve, reject) => {
    socketBar.onclose = (event) => {
      expect(event.code).toBe(1005)
      expect(event.reason).toBe('Some reason')
      resolve()
    }
  })

  return Promise.all([doneFoo, doneBar])
})

test('globals', () => {
  const myServer = new Server('ws://example.com')
  const globalObj = globalObject()
  const originalWebSocket = globalObj.WebSocket

  myServer.start()

  expect(globalObj.WebSocket).toBe(WebSocket)
  expect(myServer.originalWebSocket).toBe(originalWebSocket)

  myServer.stop()

  expect(myServer.originalWebSocket).toBeNull()
  expect(globalObj.WebSocket).toBe(originalWebSocket)
})
