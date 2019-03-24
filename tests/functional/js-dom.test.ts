import 'jest'

import jsdom from 'jsdom'

const { JSDOM } = jsdom

test('that mock-socket can be used within JSDOM', () => {
  return JSDOM.fromFile('tests/functional/js-dom.html', {
    resources: 'usable',
    runScripts: 'dangerously',
  }).then((dom) => {
    return new Promise((res) => {
      setTimeout(() => {
        const lib = (dom.window as any).MockWebSocket
        expect(lib).toBeDefined()
        expect(lib.Server).toBeDefined()
        expect(lib.WebSocket).toBeDefined()
        res()
      }, 50)
    })
  })
})
