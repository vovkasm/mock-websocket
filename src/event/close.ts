import { CloseEvent as DOMCloseEvent, CloseEventInit } from '../dom-types'

import Event from './event'

export default class CloseEvent extends Event implements DOMCloseEvent {
  readonly code: number
  readonly reason: string
  readonly wasClean: boolean

  constructor(type: string, eventInit: CloseEventInit = {}) {
    super(type, eventInit)

    this.code = eventInit.code ? Number(eventInit.code) : 0
    this.reason = eventInit.reason ? String(eventInit.reason) : ''
    this.wasClean = eventInit.wasClean ? true : false
  }
}
