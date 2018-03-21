export default function (Vue) {
  Vue.mixin({
    beforeCreate: function vuexInit() {
      const options = this.$options
      // store injection
      if (options.store) {
        this.$store = options.store
      } else if (options.parent && options.parent.$store) {
        this.$store = options.parent.$store
      }
    } 
  })
}
