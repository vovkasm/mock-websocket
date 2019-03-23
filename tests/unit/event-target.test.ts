// tslint:disable:max-classes-per-file

import 'jest'

import { createEvent } from '../../src/event/factory'
import EventTarget from '../../src/event/target'

class Mock extends EventTarget {}
class MockFoo extends EventTarget {}

test('has all the required methods', () => {
  const mock = new Mock()

  expect(typeof mock.addEventListener).toBe('function')
  expect(typeof mock.removeEventListener).toBe('function')
  expect(typeof mock.dispatchEvent).toBe('function')
})

test('adding/removing "message" event listeners works', () => {
  const mock = new Mock()
  const eventObject = createEvent({ type: 'message' })

  const fooListener = jest.fn()
  const barListener = jest.fn()

  mock.addEventListener('message', fooListener)
  mock.addEventListener('message', barListener)
  mock.dispatchEvent(eventObject)
  expect(fooListener).toHaveBeenCalledTimes(1)
  expect(barListener).toHaveBeenCalledTimes(1)

  mock.removeEventListener('message', fooListener)
  mock.dispatchEvent(eventObject)
  expect(fooListener).toHaveBeenCalledTimes(1)
  expect(barListener).toHaveBeenCalledTimes(2)

  mock.removeEventListener('message', barListener)
  mock.dispatchEvent(eventObject)
  expect(fooListener).toHaveBeenCalledTimes(1)
  expect(barListener).toHaveBeenCalledTimes(2)
})

test('events to different object should not share events', () => {
  const mock = new Mock()
  const mockFoo = new MockFoo()
  const eventObject = createEvent({ type: 'message' })

  const fooListener = jest.fn()
  const barListener = jest.fn()

  mock.addEventListener('message', fooListener)
  mockFoo.addEventListener('message', barListener)
  mock.dispatchEvent(eventObject)
  mockFoo.dispatchEvent(eventObject)
  expect(fooListener).toHaveBeenCalledTimes(1)
  expect(barListener).toHaveBeenCalledTimes(1)

  mock.removeEventListener('message', fooListener)
  mock.dispatchEvent(eventObject)
  mockFoo.dispatchEvent(eventObject)
  expect(fooListener).toHaveBeenCalledTimes(1)
  expect(barListener).toHaveBeenCalledTimes(2)

  mockFoo.removeEventListener('message', barListener)
  mock.dispatchEvent(eventObject)
  mockFoo.dispatchEvent(eventObject)
  expect(fooListener).toHaveBeenCalledTimes(1)
  expect(barListener).toHaveBeenCalledTimes(2)
})

test('that adding the same function twice for the same event type is only added once', () => {
  const mock = new Mock()
  const fooListener = jest.fn()
  const barListener = jest.fn()

  mock.addEventListener('message', fooListener)
  mock.addEventListener('message', fooListener)
  mock.addEventListener('message', barListener)

  expect(mock.listeners.message).toHaveLength(2)
})

test('that dispatching an event with multiple data arguments works correctly', () => {
  const mock = new Mock()
  const eventObject = createEvent({
    type: 'message',
  })

  const fooListener = jest.fn()

  mock.addEventListener('message', fooListener)
  mock.dispatchEvent(eventObject, 'foo', 'bar', 'baz')

  expect(fooListener).toHaveBeenCalledWith('foo', 'bar', 'baz')
})
