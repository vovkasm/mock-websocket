declare var window: any

export default function retrieveGlobalObject(this: any) {
  if (typeof window !== 'undefined') {
    return window
  }

  return typeof process === 'object' && typeof require === 'function' && typeof global === 'object' ? global : this
}
