import { ERROR_PREFIX } from '../constants'
import { Event as DOMEvent, EventInit, EventTarget as DOMEventTarget } from '../dom-types'

export default class Event implements DOMEvent {
  static readonly NONE = 0
  static readonly CAPTURING_PHASE = 1
  static readonly AT_TARGET = 2
  static readonly BUBBLING_PHASE = 3

  cancelBubble: boolean
  readonly composed: boolean
  readonly defaultPrevented: boolean
  readonly eventPhase: number
  readonly isTrusted: boolean
  returnValue: boolean
  readonly timeStamp: number
  readonly srcElement = null

  readonly NONE = Event.NONE
  readonly CAPTURING_PHASE = Event.CAPTURING_PHASE
  readonly AT_TARGET = Event.AT_TARGET
  readonly BUBBLING_PHASE = Event.BUBBLING_PHASE

  private _bubbles: boolean
  private _cancelable: boolean
  private _type: string
  private _target: DOMEventTarget | null
  private _currentTarget: DOMEventTarget | null

  get type(): string {
    return this._type
  }

  get bubbles(): boolean {
    return this._bubbles
  }

  get cancelable(): boolean {
    return this._cancelable
  }

  get target(): DOMEventTarget | null {
    return this._target
  }

  get currentTarget(): DOMEventTarget | null {
    return this._currentTarget
  }

  constructor(type: string, eventInit: EventInit = {}) {
    if (!type) {
      throw new TypeError(`${ERROR_PREFIX.EVENT.CONSTRUCT} 1 argument required, but only 0 present.`)
    }

    if (typeof eventInit !== 'object') {
      throw new TypeError(`${ERROR_PREFIX.EVENT.CONSTRUCT} parameter 2 ('eventInitDict') is not an object.`)
    }

    this._type = String(type)
    this.timeStamp = Date.now()
    this._target = null
    this.returnValue = true
    this.isTrusted = false
    this.eventPhase = 0
    this.defaultPrevented = false
    this._currentTarget = null
    this._cancelable = eventInit.cancelable ? true : false
    this.cancelBubble = false
    this._bubbles = eventInit.bubbles ? true : false
    this.composed = eventInit.composed ? true : false
  }

  initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void {
    this._type = String(type)
    this._bubbles = !!bubbles
    this._cancelable = !!cancelable
  }

  composedPath(): DOMEventTarget[] {
    return []
  }

  preventDefault(): void {
    // TODO
  }

  stopImmediatePropagation(): void {
    // TODO
  }

  stopPropagation(): void {
    // TODO
  }

  _setTarget(target: DOMEventTarget): void {
    this._target = target
    this._currentTarget = target
  }
}
