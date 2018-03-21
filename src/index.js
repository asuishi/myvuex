import { assert, isPromise} from  './util'
import applyMixin from './mixin'
let Vue

class Store {
  constructor(options = {}) {
    assert(Vue, `must call Vue.use(Vuex) before creating a store instance`)
    const {
      state = {}
    } = options

    this._options = options
    this._committing = false
    this._mutations = Object.create(null)
    this._actions = Object.create(null)
    this._wrappedGetters = Object.create(null)

    const store = this
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch(type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit(type, payload, options) {
      return commit.call(store, type, payload, options)
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
    const mutation = { type, payload }
    const entry = this._mutations[type]
    if (!entry) {
      console.error(`[vuex] unknown mutation type: ${type}`)
      return
    }
    this._withCommit(() => {
      entry.forEach(function commitIterator(handler) {
        handler(payload)
      })
    })
  }
  dispatch(type, payload) {
    const entry = this._actions[type]
    if (!entry) {
      console.error(`[vuex] unknown action type: ${type}`)
      return
    }
    return entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)
  }
  _withCommit(fn) {
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
  }
}

function resetStoreVM(store, state) {
  store.getters = {}
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  Object.keys(wrappedGetters).forEach(key => {
    const fn = wrappedGetters[key]
    // use computed to leverage its lazy-caching mechanism
    computed[key] = () => fn(store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key]
    })
  })
  store._vm = new Vue({
    data: { state },
    computed
  })
  enableStrictMode(store)
}
function installModule(store, rootState, module) {
  const {
    state,
    actions,
    mutations,
    getters
  } = module

  if (mutations) {
    Object.keys(mutations).forEach(key => {
      registerMutation(store, key, mutations[key])
    })
  }
  if (actions) {
    Object.keys(actions).forEach(key => {
      registerAction(store, key, actions[key])
    })
  }
  if (getters) {
    wrapGetters(store, getters)
  }
}
function enableStrictMode(store) {
  store._vm.$watch('state', () => {
    assert(store._committing, `Do not mutate vuex store state outside mutation handlers.`)
  }, { deep: true, sync: true })
}

function registerMutation(store, type, handler) {
  const entry = store._mutations[type] = []
  entry.push(function wrappedMutationHandler(payload) {
    handler(store.state, payload)
  })
}

function registerAction(store, type, handler) {
  const entry = store._actions[type] = []
  const { dispatch, commit } = store
  entry.push(function wrappedActionHandler(payload, cb) {
    let res = handler({
      dispatch,
      commit,
      getters: store.getters,
      state: store.state,
    }, payload, cb)
    if (!isPromise(res)) {
      res = Promise.resolve(res)
    }
    return res
  })
}

function wrapGetters(store, moduleGetters) {
  Object.keys(moduleGetters).forEach(getterKey => {
    const rawGetter = moduleGetters[getterKey]
    store._wrappedGetters[getterKey] = function wrappedGetter(store) {
      return rawGetter(
        store.state, // local state
        store.getters // getters
      )
    }
  })
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