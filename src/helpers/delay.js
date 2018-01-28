/*
* This delay allows the thread to finish assigning its on* methods
* before invoking the delay callback.
*
* @param {callback: function} the callback which will be invoked after the timeout
* @parma {context: object} the context in which to invoke the function
*/
export default function delay(callback, context) {
  setImmediate(ctx => callback.call(ctx), context);
}
