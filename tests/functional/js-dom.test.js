import 'jest';

import jsdom from 'jsdom';

const { JSDOM } = jsdom;

test('that mock-socket can be used within JSDOM', () => {
  const options = {
    resources: 'usable',
    runScripts: 'dangerously'
  };

  return JSDOM.fromFile('tests/functional/js-dom.html', options).then(dom => {
    return new Promise(res => {
      setTimeout(() => {
        expect(dom.window.MockWebSocket.Server)
        expect(dom.window.MockWebSocket.WebSocket)
        res();
      }, 50);
    });  
  })

});
