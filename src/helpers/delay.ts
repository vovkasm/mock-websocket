/**
 * This delay allows the thread to finish assigning its on* methods
 * before invoking the delay callback.
 *
 * @param callback the callback which will be invoked after the timeout
 * @param context the context in which to invoke the function
 */
export default function delay<C>(callback: (this: C) => void, context: C) {
  setImmediate((ctx: C) => callback.call(ctx), context)
}
