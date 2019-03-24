import URL from 'url-parse'

import { CLOSE_CODES } from './constants'
import { CloseEventInit, WebSocket as DOMWebSocket } from './dom-types'
import { createCloseEvent, createEvent, createMessageEvent } from './event/factory'
import { filter } from './helpers/array-helpers'
import globalObject from './helpers/global-object'
import networkBridge from './network-bridge'
import WebSocket from './websocket'

interface IServerOptions {
  mockGlobal?: boolean
  selectProtocol?: (protocols: string[]) => string
  verifyClient?: () => boolean
}

interface IEmitOptions {
  websockets?: WebSocket[]
}

type ErrorListener = (error: Error) => void
type CloseListener = (socket?: WebSocket) => void
type ConnectionListener = (socket: WebSocket) => void
type MessageListener = (socket: WebSocket, data: any) => void

interface IServerEventsMap {
  connection: ConnectionListener
  close: CloseListener
  message: MessageListener
  error: ErrorListener
}

/*
 * https://github.com/websockets/ws#simple-server
 */
class Server {
  url: string
  originalWebSocket: DOMWebSocket | null
  options: IServerOptions

  listeners: Map<string, any> = new Map()

  /*
   * @param {string} url
   */
  constructor(url: string, options: IServerOptions = {}) {
    const urlRecord = new URL(url)
    if (!urlRecord.pathname) {
      urlRecord.set('pathname', '/')
    }

    this.url = urlRecord.toString()

    this.originalWebSocket = null
    const server = networkBridge.attachServer(this, this.url)

    if (!server) {
      this.dispatchError(new Error('A mock server is already listening on this url'))
    }

    if (typeof options.mockGlobal === 'undefined') {
      options.mockGlobal = true
    }

    this.options = options

    this.start()
  }

  /*
   * Attaches the mock websocket object to the global object
   */
  start() {
    if (!this.options.mockGlobal) return

    const globalObj = globalObject()

    if (globalObj.WebSocket) {
      this.originalWebSocket = globalObj.WebSocket
    }

    globalObj.WebSocket = WebSocket
  }

  /*
   * Removes the mock websocket object from the global object
   */
  stop(callback?: () => void) {
    if (this.options.mockGlobal) {
      const globalObj = globalObject()

      if (this.originalWebSocket) {
        globalObj.WebSocket = this.originalWebSocket
      } else {
        delete globalObj.WebSocket
      }

      this.originalWebSocket = null
    }

    networkBridge.removeServer(this.url)

    if (typeof callback === 'function') callback()
  }

  /*
   * This is the main function for the mock server to subscribe to the on events.
   *
   * ie: mockServer.on('connection', function() { console.log('a mock client connected'); });
   *
   * @param {string} type - The event key to subscribe to. Valid keys are: connection, message, and close.
   * @param {function} callback - The callback which should be called when a certain event is fired.
   */
  on<K extends keyof IServerEventsMap>(type: K, cb: IServerEventsMap[K]): void {
    if (typeof cb !== 'function') return

    const listeners = this.listeners.get(type) || []
    if (filter(listeners, (item) => item === cb).length === 0) {
      listeners.push(cb)
      this.listeners.set(type, listeners)
    }
  }

  dispatchError(error: Error) {
    const listeners = this.listeners.get('error')
    if (!listeners) return

    for (const l of listeners) {
      const cb = l as ErrorListener
      cb(error)
    }
  }

  dispatchSocketEvent(type: 'connection' | 'close' | 'message', s?: WebSocket, data?: any) {
    const listeners = this.listeners.get(type)
    if (!listeners) return

    for (const l of listeners) {
      switch (type) {
        case 'close': {
          const cb = l as CloseListener
          cb(s)
          break
        }
        case 'connection': {
          const cb = l as ConnectionListener
          if (!s) throw new Error('no socket')
          cb(s)
          break
        }
        case 'message': {
          const cb = l as MessageListener
          if (!s) throw new Error('no socket')
          if (!data) throw new Error('no data')
          cb(s, data)
          break
        }
      }
    }
  }

  /*
   * This send function will notify all mock clients via their onmessage callbacks that the server
   * has a message for them.
   *
   * @param {*} data - Any javascript object which will be crafted into a MessageObject.
   */
  send(data: any, options = {}) {
    this.emit('message', data, options)
  }

  /*
   * Sends a generic message event to all mock clients.
   */
  emit(event: string, data: any, options: IEmitOptions = {}) {
    let websockets = options.websockets

    if (!websockets) {
      websockets = networkBridge.websocketsLookup(this.url)
    }

    if (typeof options !== 'object' || arguments.length > 3) {
      data = Array.prototype.slice.call(arguments, 1, arguments.length)
    }

    websockets.forEach((socket) => {
      socket.dispatchEvent(createMessageEvent({ data, origin: this.url, target: socket, type: event }))
    })
  }

  /*
   * Closes the connection and triggers the onclose method of all listening
   * websockets. After that it removes itself from the urlMap so another server
   * could add itself to the url.
   *
   * @param {object} options
   */
  close(options: CloseEventInit = {}) {
    const { code, reason, wasClean } = options
    const listeners = networkBridge.websocketsLookup(this.url)

    // Remove server before notifications to prevent immediate reconnects from
    // socket onclose handlers
    networkBridge.removeServer(this.url)

    listeners.forEach((socket) => {
      socket._moveToState(WebSocket.CLOSED)
      socket.dispatchEvent(
        createCloseEvent({
          code: code || CLOSE_CODES.CLOSE_NORMAL,
          reason: reason || '',
          target: socket,
          type: 'close',
          wasClean,
        }),
      )
    })

    this.dispatchSocketEvent('close')
  }

  /*
   * Returns an array of websockets which are listening to this server
   */
  clients() {
    return networkBridge.websocketsLookup(this.url)
  }

  /*
   * Simulate an event from the server to the clients. Useful for
   * simulating errors.
   */
  simulate(event: string) {
    const listeners = networkBridge.websocketsLookup(this.url)

    if (event === 'error') {
      listeners.forEach((socket) => {
        socket._moveToState(WebSocket.CLOSED)
        socket.dispatchEvent(createEvent({ type: 'error' }))
      })
    }
  }
}

export default Server
