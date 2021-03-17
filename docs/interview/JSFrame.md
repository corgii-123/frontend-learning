## 框架的几个面试题

### Vue2.0/3.0双向数据绑定的原理

2.0版本 `ES5: Object.defineProperty()`实现数据劫持。核心思路就是重写了setter和getter，使数据修改后页面也要渲染。
缺点：需要对每个属性都进行属性的重新定义；每一个事件input都要绑定事件；需要克隆一个新的数据对象。
```html
<body>
  <span id="spanName"></span>
  <br />
  <input id="inpName" type="text" />
</body>
```
```javascript
let obj = {
  name: ''
}
let objCopy = JSON.parse(JSON.stringify(obj))
Object.defineProperty(obj, 'name', {
  get() {
    return objCopy['name']
  },
  set(value) {
  if(objCopy['name'] === value) return 
  objCopy['name'] = value
  observer()
}
})
// observer函数相当于render函数
function observer() {
  spanName.innerHTML = obj.name
  inpName.value = obj.name
}

// 将数据渲染到视图上data赋值
setTimeout(() => {
  obj.name = 'corgi'
}, 1000)
// 将视图得数据更改体现在数据上v-model
inpName.addEventListener('input', function() {
  obj.name = this.value
})
```

3.0版本 `ES6: Proxy`对属性进行统一修改，不需要重新克隆一个对象。
```javascript
let obj = {
  name: ''
}
obj = new Proxy(obj, {
  get(target, prop) {
    return target[prop]
  },
  set(target, prop, value) {
    if(target[prop] === value) return
    target[prop] = value
    observer()
  }
})
// observer函数相当于render函数
function observer() {
  spanName.innerHTML = obj.name
  inpName.value = obj.name
}

// 将数据渲染到视图上data赋值
setTimeout(() => {
  obj.name = 'corgi'
}, 1000)
// 将视图得数据更改体现在数据上v-model
inpName.addEventListener('input', function() {
  obj.name = this.value
})

```

### MVC和MVVM的区别

只要能用数据影响视图，那视图中的onChange、onInput事件都能改变数据，所以这两者差别并不大，无非就是一个实现了内置的事件监听，另一个需要自己去写而已。
React之所以选择MVC是因为它不认为所有的input框都需要双向数据绑定。

### MVVM的理解

### 响应式数据的原理
1. 核心点：`Object.defineProperty()`
2. 默认vue在初始化数据时，重新定义`get()`和`set()`， `get()`中会进行依赖收集，属性变化会通知相关依赖进行更新。
3. 对于数组采用了原型链重写，调用数组api时需要通知依赖更新，如果数组中有引用类型，会重新采用`observer()`。

#### 细节
`initData(vm: Component)`（初始化用户存入的data数据）中会去`observer(data)`（判断是否已经观测过这些数据，没有观测则创建`new Observer`进行数据观测）。
`Observer`类中分为观测数组和观测对象，对象的观测采用`this.walk(value)`；若是对于数组的变化，并不是采用`this.walk(value)`，而是函数劫持重写数组的方法。
**对象**：`this.walk(value)`中使用了`defineReactive(obj, keys[])`定义响应式，也就是对应`Object.defineProperty()`，若此时对象中嵌套对象，则会采用递归重新调用`observer(data)`。
`Object.defineProperty()`中设置了`get(){}`和`set(){}`，get中`dep.depend()`收集依赖的`watcher`，数据变化会去通知`watcher`更新数据，相当于调用了`set()`，如果当前的值和先前的值不一样，调用核心方法`dep.notify()`通知视图更新。
因为`data: {}`一定是一个对象，所以不会去`observer(data)`基础类型。
**数组**：先判断支不支持原型链，原型链指向自己改写的数组`api = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']`，因为他们会改写数组本身。在这些方法被调用后会手动`dep.notify()`通知视图更新，不过在此之前也会去用`observer()`观测数组新增的变量。同样地在先前的Observer类中也需要对数组中遍历每一项观测。因为不会对非对象进行观测，所以数组中的**基本类型(不是对象)或直接对数组中的变量进行赋值**操作不能响应式地变化。

### 为何Vue采用异步渲染
**原因**：`Vue`是组件级更新，如果不采用异步更新，每次更新数据都会对当前组件进行重新渲染，所以为了性能考虑，会在本轮数据更新后再去异步更新视图，可以看作渲染节流，核心方法就是`nextTick()`。

#### 细节
`dep.notify()`后会通知`watcher`进行`update()`(这里每个属性都会有他自己的`dep`，`dep`中对应着1或n个`watcher`)，`update()`中，判断不为`lazy: true`，将每个`watcher`放到队列中，放入的过程中需要过滤已有的相同的`watcher`，接着调用`nextTick(flushSchedulerQueue)`，在下一tick中刷新watcher队列。
`flushSchedulerQueue()`做的事情是取出各个watcher，先触发更新前的方法`watcher.before()`，然后真正的执行`watcher.run()`，执行完成后调用生命周期钩子函数。

### nextTick的实现原理
**理解**：`nextTick`主要基于宏任务和微任务，定义了一个异步方法，多次调用`nextTick`会将方法储存在队列中，通过这个异步方法清空当前队列，所以这个nextTick就是异步方法。

#### 细节
用户会用`nextTick(cb)`保证视图的渲染完成，这里是在flushQueue已经结束了后，获取了最新数据的情况下。
`nextTick(cb)`会把传入的函数依次地放进回调队列中，在判断当前是否在`pending`，没有就去调用`timerFunc()`，`timerFunc()`中会去先判断当前浏览器是否支持Promise，支持就把`flushCallbacks()`放到then中，也就是异步地去执行`flushCallbacks()`，说白了就是去执行放入`nextTick`中的方法；如果Promise不支持就是用另一个微任务方法`MutationObserver()`或下一个`setImmediate()`。

### Computed的特点
**理解**：`computed`和`watch`和`method`区别，方法特点是每次变化会重新的视图渲染，性能开销大；计算属性则是具备缓存，渲染的时候依赖的属性没有发生变化，就不会导致重新执行；计算属性和监听内部都是使用的`watcher`，但是计算属性具备缓存的功能。

#### 细节
首先执行`initComponent()`，拿到用户定义并在内部创建`watcher`把用户定义传进，标识好`watcher`是`lazy: true`和`dirty: true`，这就实在表明这是计算属性，还会把`watcher`中用户定义的函数存入`getter`，判断`lazy: true`则什么都不做。
回到`initComponent()`中去`defineComputed(vm, key, useDef)`，定义计算属性，同样使用`Object.defineProperty()`进行定义属性，这里面的第三个参数，采用自己定义的`createComputedGetter()`，使取值的时候调用这里面的方法，判断是否为`watcher.dirty: true`，是的话就调用`watcher.evaluate()`。
`watcher.evaluate()`方法中先将`watcher`放到全局上，当取这个值的时候会进行依赖收集，即当前计算属性的`watcher`收集起来，数据一变就会调用之前的`update()`，是计算属性就把`this.dirty = true`，方便下次求值。最后调用`this.get()`方法也就是`this.getter()`方法（用户自定义的函数）。通过`dirty`实现了缓存机制

### watch中`deep: true`如何实现
**理解**：会对对象中的每一项进行求值，会将当前的watcher存入对应的属性依赖中，这样数组中对象发生变化也会通知数据更新。

#### 细节
`createWatcher()`调用，里面核心方法是使用了`vm.$watch()`，创建一个watcher使用的是`new Watcher(vm, expOrFn, cb, options)`，第二个参数就是传入的字符串指定那个变量，cb是定义的回调函数，继续进行取值的操作，将传入的字符串包装成函数(模板字符串)。
`this.lazy: false`，调用`this.get()`，把watcher放到全局上，进行依赖收集直接执行`this.getter()`，如果是`deep: true`就每一项遍历并递归把watcher存起来。

### Vue的生命周期
掌握生命周期在什么时候被调用，每个生命周期内部可以做什么事

### Vue的key有什么用

1. 用来区分元素。
2. 尽量不要使用index作为key，因为若是reverse了会全部创建新的元素，效率低。
3. 使用唯一的key值区分元素，就不会造成性能问题。
4. 可以自己用模板字负串自己定义key。

### v-if和v-show的使用

1. template标签不能和v-show连用。
2. vue中会默认采用复用代码，注意在v-if和v-else中使用:key属性。

### computed和watch

1. 用法不一样，只是有的时候可以实现相同的功能。
2. 计算是根据某个值来算，watch是监听某个值的变化。
3. 底层都是通过`vm.$watch`

