首先从一个例子入手[链接](http://runjs.cn/code/cklhixil)

改变example2 输入框的值，发现example1总的值也跟着改变，而且页面做出了响应式的变化。
进一步，如果我们取消example2的视图，使其作为一个状态管理容器，再加上一些操作读取的方式就构成了一个Vuex[例子](http://runjs.cn/code/4d8fvyv6)

接下来先列出Vuex几个要求

1. 如何讲store注入到每个组件，通过this.$store直接访问
2. 如何区分state是外部直接修改，还是通过mutation方法修改的？
3. 如何通过commit执行mutation中的函数

> 1

Vue 中的全局混入mixins提供了一个方法，可以影响到所有之后创建的实例
```js
Vue.mixin({
  beforeCreate: function () {
    // 将会在每个组件create之前执行
  }
})
```
我们从根组件开始注入，首先取$options中的store,如果没有就从父组件取
```js
Vue.mixin({
  beforeCreate: function () {
    const options = this.$options
    if (options.store) {
      this.$store = options.store
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store
    }
  }
})
```
这样，在computed执行之前可以通过this.$store取到store中的数据

>2

```
m.$watch( expOrFn, callback, [options] )
```

Vue提供了$watch方法，可以观察一个表达式的变化，通过options参数deep可以同时监控子属性
```
Vue.$watch('store', () => {
    if(!store._committing){
     console.warn(`Do not mutate vuex store state outside mutation handlers.`)
}, { deep: true, sync: true })
```
当_committing为false时,直接修改state的值会报错，但是值是能够修改的，通过mutation 修改时，将_committing置为true就不会报错了
所以区分state是外部直接修改就是通过一个变量解决了
### 不要在发布环境下启用这个模式

Vuex通过strict控制是否启动监控

> 3 如何通过commit执行mutation中的函数
```
const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
})
```
如上一个典型的Vuex代码，我们将mutations 中的方法存到一个对象中，commit是读取这个对象就可了，需要注意的是this通过bind绑定。

> 将上边三个解决方法综合一下，一个简单的Vuex就出来了