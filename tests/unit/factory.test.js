import 'jest';

import { createEvent, createMessageEvent, createCloseEvent } from '../../src/event/factory';

const fakeObject = { foo: 'bar' };

test('that the create methods throw errors if no type if specified', () => {
  expect(() => createEvent()).toThrow();
  expect(() => createMessageEvent()).toThrow();
});

test('that createEvent correctly creates an event', () => {
  let event = createEvent({
    type: 'open'
  });

  expect(event.type).toBe('open');
  expect(event.target).toBe(null);
  expect(event.srcElement).toBe(null);
  expect(event.currentTarget).toBe(null);

  event = createEvent({
    type: 'open',
    target: fakeObject
  });

  expect(event.target).toEqual( fakeObject); 
  expect(event.srcElement).toEqual( fakeObject); 
  expect(event.currentTarget).toEqual( fakeObject); 
});

test('that createMessageEvent correctly creates an event', () => {
  let event = createMessageEvent({
    type: 'message',
    origin: 'ws://localhost:8080',
    data: 'Testing'
  });

  expect(event.type).toBe( 'message')
  expect(event.data).toBe( 'Testing')
  expect(event.origin).toBe( 'ws://localhost:8080')
  expect(event.target).toBe( null);
  expect(event.lastEventId).toBe( '');
  expect(event.srcElement).toBe( null);
  expect(event.currentTarget).toBe( null);

  event = createMessageEvent({
    type: 'close',
    origin: 'ws://localhost:8080',
    data: 'Testing',
    target: fakeObject
  });

  expect(event.lastEventId).toBe('');
  expect(event.target).toEqual(fakeObject);
  expect(event.srcElement).toEqual(fakeObject);
  expect(event.currentTarget).toEqual(fakeObject);
});

test('that createCloseEvent correctly creates an event', () => {
  let event = createCloseEvent({ type: 'close' });

  expect(event.code).toBe(0)
  expect(event.reason).toBe('')
  expect(event.target).toBe(null)
  expect(event.wasClean).toBe(false)
  expect(event.srcElement).toBe(null)
  expect(event.currentTarget).toBe(null)

  event = createCloseEvent({
    type: 'close',
    code: 1001,
    reason: 'my bad',
    target: fakeObject
  });

  expect(event.code).toBe(1001)
  expect(event.reason).toBe('my bad')
  expect(event.target).toEqual(fakeObject)
  expect(event.srcElement).toEqual(fakeObject)
  expect(event.currentTarget).toEqual(fakeObject)

  event = createCloseEvent({
    type: 'close',
    code: 1000
  });

  expect(event.wasClean).toBeTruthy()
});
