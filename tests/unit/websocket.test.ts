import 'jest'

import EventTarget from '../../src/event/target'
import WebSocket from '../../src/websocket'

test('that not passing a url throws an error', () => {
  expect(() => {
    const AnyWebSocket: any = WebSocket
    // tslint:disable-next-line:no-unused-expression
    new AnyWebSocket()
  }).toThrow()
})

test('that websockets inherents EventTarget methods', () => {
  const mySocket = new WebSocket('ws://not-real')
  expect(mySocket).toBeInstanceOf(EventTarget)
})

test('that on(open, message, error, and close) can be set', () => {
  const mySocket = new WebSocket('ws://not-real')

  mySocket.onopen = jest.fn()
  mySocket.onmessage = jest.fn()
  mySocket.onclose = jest.fn()
  mySocket.onerror = jest.fn()

  const listeners = mySocket.listeners

  expect(listeners.open).toHaveLength(1)
  expect(listeners.message).toHaveLength(1)
  expect(listeners.close).toHaveLength(1)
  expect(listeners.error).toHaveLength(1)
})

test('that passing protocols into the constructor works', () => {
  const s1 = new WebSocket('ws://not-real', 'foo')
  const s2 = new WebSocket('ws://not-real', ['bar'])

  expect(s1.protocol).toBe('foo')
  expect(s2.protocol).toBe('bar')
})

test('that sending when the socket is closed throws an expection', () => {
  const s = new WebSocket('ws://not-real', 'foo')
  s._moveToState(WebSocket.CLOSED)
  expect(() => {
    s.send('testing')
  }).toThrow()
})
