import URL from 'url-parse'

import { CLOSE_CODES, ERROR_PREFIX } from './constants'
import { BinaryType, CloseEvent, Event, EventListener, MessageEvent, WebSocket as DOMWebSocket } from './dom-types'
import { createCloseEvent, createEvent } from './event/factory'
import EventTarget from './event/target'
import delay from './helpers/delay'
import { logError } from './helpers/logger'
import networkBridge from './network-bridge'

type OpenEventListener = (ev: Event) => any
type MessageEventListener = (ev: MessageEvent) => any
type ErrorEventListener = (ev: Event) => any
type CloseEventListener = (ev: CloseEvent) => any

/**
 * The main websocket class which is designed to mimick the native WebSocket class as close
 * as possible.
 */
export default class WebSocket extends EventTarget implements DOMWebSocket {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3

  binaryType: BinaryType = 'blob'

  readonly CLOSED = WebSocket.CLOSED
  readonly CLOSING = WebSocket.CLOSING
  readonly CONNECTING = WebSocket.CONNECTING
  readonly OPEN = WebSocket.OPEN

  private _bufferedAmount: number = 0
  private _extensions: string = ''
  private _protocol: string = ''
  private _readyState: number = WebSocket.CONNECTING
  private _url: string = ''

  private _onclose: CloseEventListener | null = null
  private _onerror: ErrorEventListener | null = null
  private _onmessage: MessageEventListener | null = null
  private _onopen: OpenEventListener | null = null

  get bufferedAmount() {
    return this._bufferedAmount
  }
  get extensions(): string {
    return this._extensions
  }
  get protocol(): string {
    return this._protocol
  }
  get readyState(): number {
    return this._readyState
  }
  get url(): string {
    return this._url
  }

  get onclose(): CloseEventListener | null {
    return this._onclose
  }
  set onclose(l: CloseEventListener | null) {
    if (this._onclose) {
      this.removeEventListener('close', this._onclose as EventListener)
      this._onclose = null
    }
    if (l) {
      this._onclose = l
      this.addEventListener('close', l as EventListener)
    }
  }

  get onerror(): ErrorEventListener | null {
    return this._onerror
  }
  set onerror(l: ErrorEventListener | null) {
    if (this._onerror) {
      this.removeEventListener('error', this._onerror)
      this._onerror = null
    }
    if (l) {
      this._onerror = l
      this.addEventListener('error', l)
    }
  }

  get onmessage(): MessageEventListener | null {
    return this._onmessage
  }
  set onmessage(l: MessageEventListener | null) {
    if (this._onmessage) {
      this.removeEventListener('message', this._onmessage as EventListener)
      this._onmessage = null
    }
    if (l) {
      this._onmessage = l
      this.addEventListener('message', l as EventListener)
    }
  }

  get onopen(): OpenEventListener | null {
    return this._onopen
  }
  set onopen(l: OpenEventListener | null) {
    if (this._onopen) {
      this.removeEventListener('open', this._onopen)
      this._onopen = null
    }
    if (l) {
      this._onopen = l
      this.addEventListener('open', l)
    }
  }

  /**
   * @param {string} url
   */
  constructor(url: string, protocol: string | string[] = '') {
    super()

    if (!url) {
      throw new TypeError(`${ERROR_PREFIX.CONSTRUCTOR_ERROR} 1 argument required, but only 0 present.`)
    }

    const urlRecord = new URL(url)

    if (urlRecord.protocol !== 'ws:' && urlRecord.protocol !== 'wss:') {
      throw new Error('SyntaxError: url scheme incorrect')
    }
    if (urlRecord.hash) {
      throw new Error('SyntaxError: url fragment exists')
    }

    if (!urlRecord.pathname) {
      urlRecord.set('pathname', '/')
    }
    this._url = urlRecord.toString()

    let protocols: string[] = []
    if (typeof protocol === 'string') {
      this._protocol = protocol
      protocols = [protocol]
    } else if (Array.isArray(protocol) && protocol.length > 0) {
      this._protocol = protocol[0]
      protocols = [...protocol]
    }

    const server = networkBridge.attachWebSocket(this, this.url)
    if (!server) {
      delay(function delayCallback() {
        this._readyState = WebSocket.CLOSED
        this.dispatchEvent(createEvent({ type: 'error', target: this }))
        this.dispatchEvent(createCloseEvent({ type: 'close', target: this, code: CLOSE_CODES.CLOSE_NORMAL }))

        logError(`WebSocket connection to '${this.url}' failed`)
      }, this)
      return
    }

    if (typeof server.options.verifyClient === 'function' && !server.options.verifyClient()) {
      delay(function delayCallback() {
        this._readyState = WebSocket.CLOSED
        networkBridge.removeWebSocket(this, this.url)
        this.dispatchEvent(createEvent({ type: 'error', target: this }))
        this.dispatchEvent(createCloseEvent({ type: 'close', target: this, code: CLOSE_CODES.CLOSE_NORMAL }))
        logError(
          `WebSocket connection to '${this.url}' failed: HTTP Authentication failed; no valid credentials available`,
        )
      }, this)
      return
    }

    if (typeof server.options.selectProtocol === 'function') {
      const selected = server.options.selectProtocol(protocols)
      const isFilled = selected !== ''
      const isRequested = protocols.indexOf(selected) !== -1
      if (isFilled && !isRequested) {
        delay(function delayCallback() {
          this._readyState = WebSocket.CLOSED
          networkBridge.removeWebSocket(this, this.url)
          this.dispatchEvent(createEvent({ type: 'error', target: this }))
          this.dispatchEvent(createCloseEvent({ type: 'close', target: this, code: CLOSE_CODES.CLOSE_NORMAL }))
          logError(`WebSocket connection to '${this.url}' failed: Invalid Sub-Protocol`)
        }, this)
        return
      }
      this._protocol = selected
    }

    delay(function delayCallback() {
      this._readyState = WebSocket.OPEN
      this.dispatchEvent(createEvent({ type: 'open', target: this }))
      server.dispatchSocketEvent('connection', this)
    }, this)
  }

  /*
   * Transmits data to the server over the WebSocket connection.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#send()
   */
  send(data: any) {
    if (this.readyState === WebSocket.CONNECTING) {
      networkBridge.removeWebSocket(this, this.url)
      throw new Error('InvalidStateError')
    }
    if (this.readyState === WebSocket.CLOSING || this.readyState === WebSocket.CLOSED) {
      throw new Error('WebSocket is already in CLOSING or CLOSED state')
    }

    const server = networkBridge.serverLookup(this.url)

    if (server) {
      delay(() => {
        server.dispatchSocketEvent('message', this, data)
      }, server)
    }
  }

  /*
   * Closes the WebSocket connection or connection attempt, if any.
   * If the connection is already CLOSED, this method does nothing.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#close()
   */
  close() {
    if (this.readyState !== WebSocket.OPEN) {
      return
    }

    const server = networkBridge.serverLookup(this.url)
    const closeEvent = createCloseEvent({ type: 'close', target: this, code: CLOSE_CODES.CLOSE_NORMAL })

    networkBridge.removeWebSocket(this, this.url)

    this._readyState = WebSocket.CLOSED
    this.dispatchEvent(closeEvent)

    if (server) {
      server.dispatchSocketEvent('close', this)
    }
  }

  _moveToState(state: number) {
    this._readyState = state
  }
}
