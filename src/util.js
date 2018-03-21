export function assert( conditon, msg) {
  if(!conditon) {
    throw new Error(`[Vuex] ${msg}`)
  }
}