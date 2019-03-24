import 'jest'

import networkBridge from '../../src/network-bridge'
import Server from '../../src/server'
import WebSocket from '../../src/websocket'

beforeEach(() => {
  networkBridge.urlMap = {}
})

test('that creating a websocket with no server invokes the onerror method', (done) => {
  const mockSocket = new WebSocket('ws://localhost:8080')
  mockSocket.onerror = function error(event) {
    expect((event.target as WebSocket).readyState).toBe(WebSocket.CLOSED)
    done()
  }
})

test('that onopen is called after successfully connection to the server', (done) => {
  const server = new Server('ws://localhost:8080')
  const mockSocket = new WebSocket('ws://localhost:8080')

  mockSocket.onopen = function open(event) {
    expect((event.target as WebSocket).readyState).toBe(WebSocket.OPEN)
    server.close()
    done()
  }
})

test('that try to send data before OPEN throw exception', () => {
  const server = new Server('ws://localhost:8080')
  const sock = new WebSocket('ws://localhost:8080')
  expect(() => {
    sock.send('hello')
  }).toThrow()

  expect(server.clients()).toHaveLength(0)
})

test('that failing the verifyClient check invokes the onerror method', (done) => {
  const server = new Server('ws://localhost:8080', {
    verifyClient: () => false,
  })
  const mockSocket = new WebSocket('ws://localhost:8080')

  mockSocket.onerror = function open(event) {
    expect((event.target as WebSocket).readyState).toBe(WebSocket.CLOSED)
    server.close()
    done()
  }
})

test('that failing the verifyClient check removes the websocket from the networkBridge', (done) => {
  const server = new Server('ws://localhost:8080', {
    verifyClient: () => false,
  })
  const mockSocket = new WebSocket('ws://localhost:8080')

  mockSocket.onclose = function close() {
    const urlMap = networkBridge.urlMap['ws://localhost:8080/']
    expect(urlMap.websockets).toHaveLength(0)
    server.close()
    done()
  }
})

test('that verifyClient is only invoked if it is a function', (done) => {
  const server = new Server('ws://localhost:8080', { verifyClient: false } as any)
  const mockSocket = new WebSocket('ws://localhost:8080')

  mockSocket.onopen = function open(event) {
    expect((event.target as WebSocket).readyState).toBe(WebSocket.OPEN)
    server.close()
    done()
  }
})

test('that onmessage is called after the server sends a message', (done) => {
  const testServer = new Server('ws://localhost:8080')

  testServer.on('connection', () => {
    testServer.send('Testing')
  })

  const mockSocket = new WebSocket('ws://localhost:8080')

  mockSocket.onmessage = function message(event) {
    expect(event.data).toBe('Testing')
    done()
  }
})

test('that onclose is called after the client closes the connection', (done) => {
  const testServer = new Server('ws://localhost:8080')

  testServer.on('connection', () => {
    testServer.send('Testing')
  })

  const mockSocket = new WebSocket('ws://localhost:8080')

  mockSocket.onmessage = function message() {
    mockSocket.close()
  }

  mockSocket.onclose = function close(event) {
    expect((event.target as WebSocket).readyState).toBe(WebSocket.CLOSED)
    done()
  }
})

test('that the server gets called when the client sends a message', (done) => {
  const testServer = new Server('ws://localhost:8080')

  testServer.on('message', (sock: WebSocket, data: any) => {
    expect(data).toBe('Testing')
    done()
  })

  const mockSocket = new WebSocket('ws://localhost:8080')

  mockSocket.onopen = function open() {
    this.send('Testing')
  }
})

test('that the onopen function will only be called once for each client', () => {
  const socketUrl = 'ws://localhost:8080'
  const mockServer = new Server(socketUrl)

  const websocketBar = new WebSocket(socketUrl)
  const doneBar = new Promise((resolve, reject) => {
    websocketBar.onopen = resolve
  })

  const websocketFoo = new WebSocket(socketUrl)
  const doneFoo = new Promise((resolve, reject) => {
    websocketFoo.onopen = resolve
  })

  return Promise.all([doneBar, doneFoo]).then(() => {
    mockServer.close()
  })
})

test('closing a client will only close itself and not other clients', (done) => {
  const server = new Server('ws://localhost:8080')
  const websocketFoo = new WebSocket('ws://localhost:8080')
  const websocketBar = new WebSocket('ws://localhost:8080')

  const closeFn = jest.fn()
  websocketFoo.onclose = closeFn

  websocketBar.onopen = function open() {
    this.close()
  }

  websocketBar.onclose = function close() {
    expect(closeFn).not.toBeCalled()
    server.close()
    done()
  }
})

test('mock clients can send messages to the right mock server', () => {
  const serverFoo = new Server('ws://localhost:8080')
  const serverBar = new Server('ws://localhost:8081')
  const dataFoo = 'foo'
  const dataBar = 'bar'
  const socketFoo = new WebSocket('ws://localhost:8080')
  const socketBar = new WebSocket('ws://localhost:8081')

  const doneFoo = new Promise((resolve, reject) => {
    serverFoo.on('connection', () => {
      serverFoo.on('message', (sock: WebSocket, data: any) => {
        expect(data).toBe(dataFoo)
        resolve()
      })
    })
  })

  const doneBar = new Promise((resolve, reject) => {
    serverBar.on('connection', () => {
      serverBar.on('message', (sock: WebSocket, data: any) => {
        expect(data).toBe(dataBar)
        resolve()
      })
    })
  })

  socketFoo.onopen = function open() {
    this.send(dataFoo)
  }

  socketBar.onopen = function open() {
    this.send(dataBar)
  }

  return Promise.all([doneFoo, doneBar]).then(() => {
    serverBar.close()
    serverFoo.close()
  })
})

test('that closing a websocket removes it from the network bridge', (done) => {
  const server = new Server('ws://localhost:8080')
  const socket = new WebSocket('ws://localhost:8080')

  socket.onopen = function open() {
    const urlMap = networkBridge.urlMap['ws://localhost:8080/']
    expect(urlMap.websockets).toEqual([this])
    this.close()
  }

  socket.onclose = function close() {
    const urlMap = networkBridge.urlMap['ws://localhost:8080/']
    expect(urlMap.websockets).toHaveLength(0)
    server.close()
    done()
  }
})

test('that it is possible to simulate an error from the server to the clients', (done) => {
  const server = new Server('ws://localhost:8080')
  const socket = new WebSocket('ws://localhost:8080')

  socket.onopen = function open() {
    server.simulate('error')
  }

  socket.onerror = function error() {
    done()
  }
})

test('that failing the selectProtocol check invokes the onerror method', (done) => {
  const server = new Server('ws://localhost:8080', { selectProtocol: () => undefined } as any)
  const mockSocket = new WebSocket('ws://localhost:8080')

  mockSocket.onerror = function open(event) {
    expect((event.target as WebSocket).readyState).toBe(WebSocket.CLOSED)
    server.close()
    done()
  }
})

test('that failing the selectProtocol check removes the websocket from the networkBridge', (done) => {
  const server = new Server('ws://localhost:8080', { selectProtocol: () => undefined } as any)
  const mockSocket = new WebSocket('ws://localhost:8080')

  mockSocket.onclose = function close() {
    const urlMap = networkBridge.urlMap['ws://localhost:8080/']
    expect(urlMap.websockets).toHaveLength(0)
    server.close()
    done()
  }
})

test('that selectProtocol is only invoked if it is a function', (done) => {
  const server = new Server('ws://localhost:8080', { selectProtocol: '' } as any)
  const mockSocket = new WebSocket('ws://localhost:8080')

  mockSocket.onopen = function open(event) {
    expect((event.target as WebSocket).readyState).toBe(WebSocket.OPEN)
    server.close()
    done()
  }
})

test('that selectProtocol should be invoked with a empty string if unspecified', (done) => {
  const server = new Server('ws://localhost:8080', {
    selectProtocol(protocols) {
      expect(protocols).toEqual([''])
      return ''
    },
  })
  const mockSocket = new WebSocket('ws://localhost:8080')

  mockSocket.onopen = function open(event) {
    expect((event.target as WebSocket).protocol).toBe('')
    server.close()
    done()
  }
})

test('that selectProtocol should be invoked with a single protocol', (done) => {
  const server = new Server('ws://localhost:8080', {
    selectProtocol(protocols) {
      expect(protocols).toEqual(['text'])
      return 'text'
    },
  })
  const mockSocket = new WebSocket('ws://localhost:8080', 'text')

  mockSocket.onopen = function open(event) {
    expect((event.target as WebSocket).protocol).toBe('text')
    server.close()
    done()
  }
})

test('that selectProtocol should be able to select any of the requested protocols', (done) => {
  const server = new Server('ws://localhost:8080', {
    selectProtocol(protocols) {
      expect(protocols).toEqual(['text', 'binary'])
      return 'binary'
    },
  })
  const mockSocket = new WebSocket('ws://localhost:8080', ['text', 'binary'])

  mockSocket.onopen = function open(event) {
    expect((event.target as WebSocket).protocol).toBe('binary')
    server.close()
    done()
  }
})

test('that client should close if the subprotocol is not of the selected set', (done) => {
  const server = new Server('ws://localhost:8080', {
    selectProtocol(protocols) {
      return 'unsupported'
    },
  })
  const mockSocket = new WebSocket('ws://localhost:8080', 'text')

  mockSocket.onclose = function close() {
    const urlMap = networkBridge.urlMap['ws://localhost:8080/']
    expect(urlMap.websockets).toHaveLength(0)
    server.close()
    done()
  }
})

test('the server should be able to select _none_ of the protocols from the client', (done) => {
  const server = new Server('ws://localhost:8080', {
    selectProtocol(protocols) {
      return ''
    },
  })
  const mockSocket = new WebSocket('ws://localhost:8080', ['text', 'binary'])

  mockSocket.onopen = function open(event) {
    expect((event.target as WebSocket).protocol).toBe('')
    server.close()
    done()
  }
})
