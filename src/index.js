import { assert } from  './util'
import applyMixin from './mixin'
let Vue

class Store {
  constructor(options = {}) {
    assert(Vue, `must call Vue.use(Vuex) before creating a store instance`)
    const {
      state = {}
    } = options
    this._committing = false
    this._mutations = Object.create(null)

    const store = this
    const {  commit } = this
    this.dispatch = function boundDispatch(type, payload) {
      return dispatch.call(store, type, payload)
    }
    installModule(this, state, options)
    resetStoreVM(this, state)
    
  }
  get state () {
    return this._vm.state
  }
  set state(v) {
    assert(false, `cannot store state.`)
  }

  commit(type, payload, options) {
    const entry = this._mutations[type]
    this._withCommit(() => {
      entry(payload)
    })
  }
  _withCommit(fn) {
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
  }
}

function resetStoreVM(store, state) {
  store._vm = new Vue({
    data: { state },
  })
  enableStrictMode(store)
}
function installModule(store, rootState, module) {
  const {
    mutations
  } = module

  if (mutations) {
    Object.keys(mutations).forEach(key => {
      const handler = mutations[key]
      const entry = store._mutations[key] = function(payload) {
        handler(store.state, payload)
      }
    })
  }
}
function enableStrictMode(store) {
  store._vm.$watch('state', () => {
    assert(store._committing, `Do not mutate vuex store state outside mutation handlers.`)
  }, { deep: true, sync: true })
}

function install (_Vue) {
  if (Vue) {
    console.error(
      '[vuex] already installed. Vue.use(Vuex) should be called only once.'
    )
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}

export default {
  install,
  Store
}