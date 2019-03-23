import 'jest'

import Server from '../../src/server'
import WebSocket from '../../src/websocket'

test('mock sockets sends double messages', () => {
  const socketUrl = 'ws://localhost:8080'
  const mockServer = new Server(socketUrl)
  const mockSocketA = new WebSocket(socketUrl)
  const mockSocketB = new WebSocket(socketUrl)

  let numMessagesSent = 0
  let numMessagesReceived = 0

  const serverMessageHandler = function handlerFunc() {
    numMessagesReceived += 1
  }

  mockServer.on('connection', () => {
    mockServer.on('message', serverMessageHandler)
  })

  mockSocketA.onopen = function open() {
    numMessagesSent += 1
    this.send('1')
  }

  mockSocketB.onopen = function open() {
    numMessagesSent += 1
    this.send('2')
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      expect(numMessagesReceived).toBe(numMessagesSent)
      mockServer.close()
      resolve()
    }, 500)
  })
})
