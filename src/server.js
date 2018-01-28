import URL from 'url-parse';
import WebSocket from './websocket';
import EventTarget from './event/target';
import networkBridge from './network-bridge';
import { CLOSE_CODES } from './constants';
import globalObject from './helpers/global-object';
import { createEvent, createMessageEvent, createCloseEvent } from './event/factory';

/*
* https://github.com/websockets/ws#server-example
*/
class Server extends EventTarget {
  /*
  * @param {string} url
  */
  constructor(url, options = {}) {
    super();
    const urlRecord = new URL(url);

    if (!urlRecord.pathname) {
      urlRecord.pathname = '/';
    }

    this.url = urlRecord.toString();

    this.originalWebSocket = null;
    const server = networkBridge.attachServer(this, this.url);

    if (!server) {
      this.dispatchEvent(createEvent({ type: 'error' }));
      throw new Error('A mock server is already listening on this url');
    }

    if (typeof options.verifyClient === 'undefined') {
      options.verifyClient = null;
    }

    if (typeof options.selectProtocol === 'undefined') {
      options.selectProtocol = null;
    }

    this.options = options;

    this.start();
  }

  /*
  * Attaches the mock websocket object to the global object
  */
  start() {
    const globalObj = globalObject();

    if (globalObj.WebSocket) {
      this.originalWebSocket = globalObj.WebSocket;
    }

    globalObj.WebSocket = WebSocket;
  }

  /*
  * Removes the mock websocket object from the global object
  */
  stop(callback = () => {}) {
    const globalObj = globalObject();

    if (this.originalWebSocket) {
      globalObj.WebSocket = this.originalWebSocket;
    } else {
      delete globalObj.WebSocket;
    }

    this.originalWebSocket = null;

    networkBridge.removeServer(this.url);

    if (typeof callback === 'function') {
      callback();
    }
  }

  /*
  * This is the main function for the mock server to subscribe to the on events.
  *
  * ie: mockServer.on('connection', function() { console.log('a mock client connected'); });
  *
  * @param {string} type - The event key to subscribe to. Valid keys are: connection, message, and close.
  * @param {function} callback - The callback which should be called when a certain event is fired.
  */
  on(type, callback) {
    this.addEventListener(type, callback);
  }

  /*
  * This send function will notify all mock clients via their onmessage callbacks that the server
  * has a message for them.
  *
  * @param {*} data - Any javascript object which will be crafted into a MessageObject.
  */
  send(data, options = {}) {
    this.emit('message', data, options);
  }

  /*
  * Sends a generic message event to all mock clients.
  */
  emit(event, data, options = {}) {
    let { websockets } = options;

    if (!websockets) {
      websockets = networkBridge.websocketsLookup(this.url);
    }

    if (typeof options !== 'object' || arguments.length > 3) {
      data = Array.prototype.slice.call(arguments, 1, arguments.length);
    }

    websockets.forEach(socket => {
      if (Array.isArray(data)) {
        socket.dispatchEvent(
          createMessageEvent({
            type: event,
            data,
            origin: this.url,
            target: socket
          }),
          ...data
        );
      } else {
        socket.dispatchEvent(
          createMessageEvent({
            type: event,
            data,
            origin: this.url,
            target: socket
          })
        );
      }
    });
  }

  /*
  * Closes the connection and triggers the onclose method of all listening
  * websockets. After that it removes itself from the urlMap so another server
  * could add itself to the url.
  *
  * @param {object} options
  */
  close(options = {}) {
    const { code, reason, wasClean } = options;
    const listeners = networkBridge.websocketsLookup(this.url);

    // Remove server before notifications to prevent immediate reconnects from
    // socket onclose handlers
    networkBridge.removeServer(this.url);

    listeners.forEach(socket => {
      socket.readyState = WebSocket.CLOSE;
      socket.dispatchEvent(
        createCloseEvent({
          type: 'close',
          target: socket,
          code: code || CLOSE_CODES.CLOSE_NORMAL,
          reason: reason || '',
          wasClean
        })
      );
    });

    this.dispatchEvent(createCloseEvent({ type: 'close' }), this);
  }

  /*
  * Returns an array of websockets which are listening to this server
  */
  clients() {
    return networkBridge.websocketsLookup(this.url);
  }

  /*
   * Simulate an event from the server to the clients. Useful for
   * simulating errors.
   */
  simulate(event) {
    const listeners = networkBridge.websocketsLookup(this.url);

    if (event === 'error') {
      listeners.forEach(socket => {
        socket.readyState = WebSocket.CLOSE;
        socket.dispatchEvent(createEvent({ type: 'error' }));
      });
    }
  }
}

export default Server;
