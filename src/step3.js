
let innerVue

class Store {
  constructor(options = {}) {
    const {
      state = {},
      mutations = {}
    } = options

    this._mutations = Object.create(null)
    this._committing = false

    this._vm = new Vue({
      data: { state }
    })
    this._vm.$watch('state', () => {
      if (!this._committing) {
        throw new Error(`[Vuex] Vuex的值不能直接修改`)
      }
    }, { deep: true, sync: true })

    if (mutations) {
      Object.keys(mutations).forEach(key => {
        const handler = mutations[key]
        const entry = this._mutations[key] = (payload) => {
          this._committing = true
          handler(this.state, payload)
          this._committing = false
        }
      })
    }
  }
  get state() {
    return this._vm.state
  }
  set state(v) {
    throw new Error(`cannot store state`)
  }
  commit(type, payload) {
    const entry = this._mutations[type]
    entry(payload)
  }
}

function install(_Vue) {
  if (innerVue) {
    console.error('[vuex]已经注册')
    return
  }
  innerVue = _Vue
  innerVue.mixin({
    beforeCreate: function () {
      const options = this.$options
      if (options.store) {
        this.$store = options.store
      } else if (options.parent && options.parent.$store) {
        this.$store = options.parent.$store
      }
    }
  })
}
