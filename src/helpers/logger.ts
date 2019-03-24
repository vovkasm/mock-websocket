export function logError(message: string) {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
    // tslint:disable-next-line:no-console
    console.error(message)
  }
}
