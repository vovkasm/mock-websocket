import 'jest'

import { createCloseEvent, createEvent, createMessageEvent } from '../../src/event/factory'

const fakeObject = { foo: 'bar' }

test('that the create methods throw errors if no type if specified', () => {
  const createEventAny: any = createEvent
  expect(() => createEventAny()).toThrow()
  const createMessageEventAny: any = createMessageEvent
  expect(() => createMessageEventAny()).toThrow()
})

test('that createEvent correctly creates an event', () => {
  let event = createEvent({
    type: 'open',
  })

  expect(event.type).toBe('open')
  expect(event.target).toBe(null)
  expect(event.currentTarget).toBe(null)

  event = createEvent({
    target: fakeObject as any,
    type: 'open',
  })

  expect(event.target).toEqual(fakeObject)
  expect(event.currentTarget).toEqual(fakeObject)
})

test('that createMessageEvent correctly creates an event', () => {
  let event = createMessageEvent({ data: 'Testing', origin: 'ws://localhost:8080', type: 'message' })

  expect(event.type).toBe('message')
  expect(event.data).toBe('Testing')
  expect(event.origin).toBe('ws://localhost:8080')
  expect(event.target).toBe(null)
  expect(event.lastEventId).toBe('')
  expect(event.currentTarget).toBe(null)

  event = createMessageEvent({
    data: 'Testing',
    origin: 'ws://localhost:8080',
    target: fakeObject as any,
    type: 'close',
  })

  expect(event.lastEventId).toBe('')
  expect(event.target).toEqual(fakeObject)
  expect(event.currentTarget).toEqual(fakeObject)
})

test('that createCloseEvent correctly creates an event', () => {
  let event = createCloseEvent({ type: 'close' })

  expect(event.code).toBe(0)
  expect(event.reason).toBe('')
  expect(event.target).toBe(null)
  expect(event.wasClean).toBe(false)
  expect(event.currentTarget).toBe(null)

  event = createCloseEvent({
    code: 1001,
    reason: 'my bad',
    target: fakeObject as any,
    type: 'close',
  })

  expect(event.code).toBe(1001)
  expect(event.reason).toBe('my bad')
  expect(event.target).toEqual(fakeObject)
  expect(event.currentTarget).toEqual(fakeObject)

  event = createCloseEvent({ code: 1000, type: 'close' })

  expect(event.wasClean).toBeTruthy()
})
