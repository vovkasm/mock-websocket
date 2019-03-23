import 'jest'

import Server from '../../src/server'
import WebSocket from '../../src/websocket'

test('websocket onmessage fired before onopen', (done) => {
  const socketUrl = 'ws://localhost:8080'
  const mockServer = new Server(socketUrl)
  const mockSocket = new WebSocket(socketUrl)

  let onOpenCalled = false

  mockServer.on('connection', () => {
    mockServer.send('test message')
  })

  mockSocket.onopen = () => {
    onOpenCalled = true
  }

  mockSocket.onmessage = () => {
    expect(onOpenCalled).toBeTruthy()
    done()
  }
})
