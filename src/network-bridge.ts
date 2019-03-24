import { reject } from './helpers/array-helpers'
import Server from './server'
import WebSocket from './websocket'

interface IConnection {
  server: Server
  websockets: WebSocket[]
}

interface IURLMap {
  [url: string]: IConnection
}

/**
 * The network bridge is a way for the mock websocket object to 'communicate' with
 * all available servers. This is a singleton object so it is important that you
 * clean up urlMap whenever you are finished.
 */
class NetworkBridge {
  urlMap: IURLMap = {}

  /**
   * Attaches a websocket object to the urlMap hash so that it can find the server
   * it is connected to and the server in turn can find it.
   *
   * @param {object} websocket - websocket object to add to the urlMap hash
   * @param {string} url
   */
  attachWebSocket(websocket: WebSocket, url: string): Server | undefined {
    const connectionLookup = this.urlMap[url]

    if (!connectionLookup || !connectionLookup.server || connectionLookup.websockets.indexOf(websocket) !== -1) {
      return undefined
    }

    connectionLookup.websockets.push(websocket)
    return connectionLookup.server
  }

  /**
   * Attaches a server object to the urlMap hash so that it can find a websockets
   * which are connected to it and so that websockets can in turn can find it.
   *
   * @param {object} server - server object to add to the urlMap hash
   * @param {string} url
   */
  attachServer(server: Server, url: string): Server | undefined {
    const connectionLookup = this.urlMap[url]

    if (connectionLookup) {
      // throw new Error('Can not attach server. Already exists')
      return undefined
    }

    this.urlMap[url] = { server, websockets: [] }
    return server
  }

  /**
   * Finds the server which is 'running' on the given url.
   *
   * @param {string} url - the url to use to find which server is running on it
   */
  serverLookup(url: string): Server | undefined {
    const connectionLookup = this.urlMap[url]
    return connectionLookup ? connectionLookup.server : undefined
  }

  /**
   * Finds all websockets which is 'listening' on the given url.
   *
   * @param {string} url - the url to use to find all websockets which are associated with it
   */
  websocketsLookup(url: string): WebSocket[] {
    const connectionLookup = this.urlMap[url]
    return connectionLookup ? connectionLookup.websockets : []
  }

  /**
   * Removes the entry associated with the url.
   *
   * @param {string} url
   */
  removeServer(url: string) {
    delete this.urlMap[url]
  }

  /**
   * Removes the individual websocket from the map of associated websockets.
   *
   * @param {object} websocket - websocket object to remove from the url map
   * @param {string} url
   */
  removeWebSocket(websocket: WebSocket, url: string) {
    const connectionLookup = this.urlMap[url]

    if (connectionLookup) {
      connectionLookup.websockets = reject(connectionLookup.websockets, (socket) => socket === websocket)
    }
  }
}

export default new NetworkBridge() // Note: this is a singleton
