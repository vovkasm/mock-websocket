import { MessageEvent as DOMMessageEvent, MessageEventInit } from '../dom-types'

import Event from './event'

export default class MessageEvent extends Event implements DOMMessageEvent {
  readonly data: any
  readonly lastEventId: string
  readonly origin: string
  // TODO!
  readonly ports = []
  // TODO!
  readonly source = null

  constructor(type: string, eventInit: MessageEventInit = {}) {
    super(type, eventInit)

    this.data = eventInit.hasOwnProperty('data') ? eventInit.data : null
    this.origin = eventInit.hasOwnProperty('origin') ? String(eventInit.origin) : ''
    this.lastEventId = eventInit.hasOwnProperty('lastEventId') ? String(eventInit.lastEventId) : ''
  }
}
