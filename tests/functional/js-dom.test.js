import test from 'ava';
import jsdom from 'jsdom';

const { JSDOM } = jsdom;

test('that mock-socket can be used within JSDOM', async t => {
  const options = {
    resources: 'usable',
    runScripts: 'dangerously'
  };

  const dom = await JSDOM.fromFile('tests/functional/js-dom.html', options);

  return new Promise(res => {
    setTimeout(() => {
      t.truthy(dom.window.MockWebSocket.Server);
      t.truthy(dom.window.MockWebSocket.WebSocket);
      res();
    }, 50);
  });
});
