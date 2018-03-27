
let innerVue

class Store {
  constructor(options = {}) {
    const {
      state = {}
    } = options
    this._vm = new Vue({
      data: { state }
    })
  }
  get state() {
    return this._vm.state
  }
  set state(v) {
    throw new Error(`cannot store state`)
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
