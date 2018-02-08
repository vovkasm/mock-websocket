Javascript mocking library for <a href="https://developer.mozilla.org/en-US/docs/WebSockets">websockets</a>.
This project inspired by mock-socket library, most code still the same. But targets only plain websockets.
Currently unstable, API will change.

## Installation

```shell
npm install -D mock-websocket
```

## Usage

To use within a node environment you can simply import or require the files directly. This
option is great for phantomjs or CI environments.

```js
import { WebSocket, Server } from 'mock-websocket';

// OR

const mockServer = require('mock-socket').Server;
const mockWebSocket = require('mock-socket').WebSocket;
```

## Native WebSocket Example

```js
// chat.js
function Chat() {
  const chatSocket = new WebSocket('ws://localhost:8080');
  this.messages = [];

  chatSocket.onmessage = (event) => {
    this.messages.push(event.data);
  };
}
```

```js
// chat-test.js
import { Server } from 'mock-websocket';

describe('Chat Unit Test', () => {
  it('basic test', (done) => {
    const mockServer = new Server('ws://localhost:8080');
    mockServer.on('connection', server => {
      mockServer.send('test message 1');
      mockServer.send('test message 2');
    });

    // Now when Chat tries to do new WebSocket() it
    // will create a MockWebSocket object \
    var chatApp = new Chat();

    setTimeout(() => {
      const messageLen = chatApp.messages.length;
      assert.equal(messageLen, 2, '2 messages where sent from the s server');

      mockServer.stop(done);
    }, 100);
  });
});
```
