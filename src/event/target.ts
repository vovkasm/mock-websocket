import { filter, reject } from '../helpers/array-helpers'

import {
  AddEventListenerOptions,
  Event as DOMEvent,
  EventListenerOptions,
  EventListenerOrEventListenerObject,
  EventTarget as DOMEventTarget,
} from '../dom-types'

/*
 * EventTarget is an interface implemented by objects that can
 * receive events and may have listeners for them.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
 */
export default class EventTarget implements DOMEventTarget {
  listeners: { [type: string]: any[] }

  constructor() {
    this.listeners = {}
  }

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void {
    if (typeof listener === 'function') {
      if (!Array.isArray(this.listeners[type])) {
        this.listeners[type] = []
      }

      // Only add the same function once
      if (filter(this.listeners[type], (item) => item === listener).length === 0) {
        this.listeners[type].push(listener)
      }
    }
  }

  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ): void {
    const arrayOfListeners = this.listeners[type]
    this.listeners[type] = reject(arrayOfListeners, (listener) => listener === callback)
  }

  dispatchEvent(event: DOMEvent, ...customArguments: any[]): boolean {
    const eventName = event.type
    const listeners = this.listeners[eventName]

    if (!Array.isArray(listeners)) {
      return false
    }

    listeners.forEach((listener) => {
      if (customArguments.length > 0) {
        listener.apply(this, customArguments)
      } else {
        listener.call(this, event)
      }
    })

    return true
  }
}
