
interface ServerHandlerMap {
  'connection': ConnectionServerHandler
  'message': MessageServerHandler
  'close': CloseServerHandler
}

type ConnectionServerHandler = () => void
type MessageServerHandler = (msg: string) => void
type CloseServerHandler = () => void

interface CloseOptions {
  code?: number
  reason?: string
  wasClean?: boolean
}

interface EmitOptions {
  websockets?: WebSocket[]
}

interface Server {
  /**
   * Attaches the mock websocket object to the global object. Called authomatically in constructor.
   */
  start(): void

  /**
   * Removes the mock websocket object from the global object.
   */
  stop(callback?: () => any): void


  on<K extends keyof ServerHandlerMap> (type: K, handler: ServerHandlerMap[K]): void
  emit (event: string, data: any, options?: EmitOptions): void
  send (data: string, options?: EmitOptions): void
  simulate (event: 'error'): void
  close (options?: CloseOptions): void
  clients (): WebSocket[]
}

declare var Server: {
  prototype: Server
  new (url: string): Server
}

declare var WebSocket: {
  prototype: WebSocket
  new (url: string, protocols?: string | string[]): WebSocket
  readonly CLOSED: number
  readonly CLOSING: number
  readonly CONNECTING: number
  readonly OPEN: number
}

export { WebSocket, Server }
