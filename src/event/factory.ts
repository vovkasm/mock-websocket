import { EventTarget } from '../dom-types'

import CloseEvent from './close'
import Event from './event'
import MessageEvent from './message'

interface IEventFactoryConfig {
  type: string
  target?: EventTarget
}

/*
 * Creates an Event object and extends it to allow full modification of
 * its properties.
 *
 * @param {object} config - within config you will need to pass type and optionally target
 */
function createEvent(config: IEventFactoryConfig): Event {
  const eventObject = new Event(config.type)

  if (config.target) {
    eventObject._setTarget(config.target)
  }

  return eventObject
}

interface IMessageEventFactoryConfig extends IEventFactoryConfig {
  data?: any
  origin?: string
}

/*
 * Creates a MessageEvent object and extends it to allow full modification of
 * its properties.
 *
 * @param {object} config - within config: type, origin, data and optionally target
 */
function createMessageEvent(config: IMessageEventFactoryConfig) {
  const { type, origin, data, target } = config
  const messageEvent = new MessageEvent(type, { data, origin })

  if (target) {
    messageEvent._setTarget(target)
  }

  return messageEvent
}

interface ICloseEventFactoryConfig extends IEventFactoryConfig {
  code?: number
  reason?: string
  wasClean?: boolean
}

/*
 * Creates a CloseEvent object and extends it to allow full modification of
 * its properties.
 *
 * @param {object} config - within config: type and optionally target, code, and reason
 */
function createCloseEvent(config: ICloseEventFactoryConfig) {
  const { code, reason, type, target } = config
  let { wasClean } = config

  if (!wasClean) {
    wasClean = code === 1000
  }

  const closeEvent = new CloseEvent(type, { code, reason, wasClean })

  if (target) {
    closeEvent._setTarget(target)
  }

  return closeEvent
}

export { createEvent, createMessageEvent, createCloseEvent }
