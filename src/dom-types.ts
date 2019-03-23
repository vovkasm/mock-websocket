// tslint:disable:interface-name

export interface WebSocketEventMap {
  close: CloseEvent
  error: Event
  message: MessageEvent
  open: Event
}

export interface WebSocket extends EventTarget {
  binaryType: BinaryType
  readonly bufferedAmount: number
  readonly extensions: string
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null
  onerror: ((this: WebSocket, ev: Event) => any) | null
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null
  onopen: ((this: WebSocket, ev: Event) => any) | null
  readonly protocol: string
  readonly readyState: number
  readonly url: string
  readonly CLOSED: number
  readonly CLOSING: number
  readonly CONNECTING: number
  readonly OPEN: number

  close(code?: number, reason?: string): void
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void
  addEventListener<K extends keyof WebSocketEventMap>(
    type: K,
    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void
  removeEventListener<K extends keyof WebSocketEventMap>(
    type: K,
    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void
}

export interface WebSocketClass {
  prototype: WebSocket
  readonly CLOSED: number
  readonly CLOSING: number
  readonly CONNECTING: number
  readonly OPEN: number

  new (url: string, protocols?: string | string[]): WebSocket
}

export interface Event {
  readonly bubbles: boolean
  cancelBubble: boolean
  readonly cancelable: boolean
  readonly composed: boolean
  readonly currentTarget: EventTarget | null
  readonly defaultPrevented: boolean
  readonly eventPhase: number
  readonly isTrusted: boolean
  returnValue: boolean
  readonly target: EventTarget | null
  readonly timeStamp: number
  readonly type: string

  readonly AT_TARGET: number
  readonly BUBBLING_PHASE: number
  readonly CAPTURING_PHASE: number
  readonly NONE: number

  composedPath(): EventTarget[]
  preventDefault(): void
  stopImmediatePropagation(): void
  stopPropagation(): void
}

export interface EventClass {
  prototype: Event
  readonly AT_TARGET: number
  readonly BUBBLING_PHASE: number
  readonly CAPTURING_PHASE: number
  readonly NONE: number

  new (type: string, eventInitDict?: EventInit): Event
}

export interface CloseEvent extends Event {
  readonly code: number
  readonly reason: string
  readonly wasClean: boolean
}

export interface CloseEventClass {
  prototype: CloseEvent
  new (type: string, eventInitDict?: CloseEventInit): CloseEvent
}

export interface MessageEvent extends Event {
  readonly data: any
  readonly lastEventId: string
  readonly origin: string
}

export interface MessageEventClass {
  prototype: MessageEvent
  new (type: string, eventInitDict?: MessageEventInit): MessageEvent
}

export interface EventTarget {
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void
  dispatchEvent(event: Event): boolean
  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ): void
}

export type EventListenerOrEventListenerObject = EventListener | EventListenerObject

export type EventListener = (evt: Event) => void

export interface EventListenerObject {
  handleEvent(evt: Event): void
}

export interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean
  passive?: boolean
}

export interface EventListenerOptions {
  capture?: boolean
}

export interface EventInit {
  bubbles?: boolean
  cancelable?: boolean
  composed?: boolean
}

export interface CloseEventInit extends EventInit {
  code?: number
  reason?: string
  wasClean?: boolean
}

export interface MessageEventInit extends EventInit {
  data?: any
  lastEventId?: string
  origin?: string
}

export type BinaryType = 'blob' | 'arraybuffer'

interface Blob {
  readonly size: number
  readonly type: string
  slice(start?: number, end?: number, contentType?: string): Blob
}
