export function assert( conditon, msg) {
  if(!conditon) {
    throw new Error(`[Vuex] ${msg}`)
  }
}
export function isPromise(val) {
  return val && typeof val.then === 'function'
}