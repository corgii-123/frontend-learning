## Vue源码学习

> 仅使用200+行，完成简化版Vue，包括Compile、Observer、Watcher、Dep类的功能实现MVVM

```javascript
const compileUtil = {
  html(node, expr, vm) {
    const value = this.getVal(expr, vm)
    // 对数据进行监听
    new Watcher(vm, expr, (newValue) => {
      this.updater.htmlUpdater(node, newValue)
    })
    // 初始化页面
    this.updater.htmlUpdater(node, value)
  },
  getContentVal(expr, vm) {
    return expr.replace(/\{\{(.+?)\}\}/, (...args) => {
      return this.getVal(args[1], vm)
    })
  },
  text(node, expr, vm) {
    let value
    if (expr.includes('{{')) {
      value = expr.replace(/\{\{(.+?)\}\}/, (...args) => {
        // 对数据进行监听
        new Watcher(vm, args[1], (newValue) => {
          this.updater.textUpdater(node, this.getContentVal(expr, vm))
        })
        return this.getVal(args[1], vm)
      })
    } else {
      value = this.getVal(expr, vm)
      new Watcher(vm, expr, (newValue) => {
        this.updater.textUpdater(node, newValue)
      })
    }
    this.updater.textUpdater(node, value)
  },
  model(node, expr, vm) {
    const value = this.getVal(expr, vm)
    // 对数据进行监听
    new Watcher(vm, expr, (newValue) => {
      this.updater.modelUpdater(node, newValue)
    })

    // 视图驱动数据再去更改视图
    node.addEventListener('input', (e) => {
      // 设置值
      this.setVal(expr, vm, e.target.value)
    })

    this.updater.modelUpdater(node, value)
  },
  on(node, expr, vm, eventName) {
    let fn = vm.$options.methods && vm.$options.methods[expr]
    node.addEventListener(eventName, fn.bind(vm), false)
  },
  bind(node, expr, vm, bindName) {
    const value = this.getVal(expr, vm)
    this.updater.attributeUpdater(node, bindName, value)
  },
  // 获取value
  getVal(expr, vm) {
    return expr.split('.').reduce((a, b) => a[b], vm.$data)
  },
  // 设置value
  setVal(expr, vm, inputVal) {
    const exprStr = expr.split('.')
    const last = exprStr.pop()
    let obj = exprStr
    if (exprStr.length > 0) {
      obj = exprStr.reduce((a, b) => a[b], vm.$data)
    }
    obj[last] = inputVal
  },
  // 更新函数
  updater: {
    textUpdater(node, value) {
      node.textContent = value
    },
    htmlUpdater(node, value) {
      node.innerHTML = value
    },
    modelUpdater(node, value) {
      node.value = value
    },
    attributeUpdater(node, attr, value) {
      node.setAttribute(attr, value)
    }
  }
}

class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el)
    this.vm = vm
    // 1. 获取文档碎片对象，放入内存中，减少回流和重绘
    const fragment = this.nodeFragment(this.el)

    // 2. 编译模板
    this.compile(fragment)

    // 3. 追加到子元素的更节点
    this.el.appendChild(fragment)

  }
  compile(fragment) {
    // 1. 获取子节点
    const childNodes = Array.from(fragment.childNodes)
    childNodes.forEach(node => {
      if (this.isElementNode(node)) {
        // 编译元素节点
        this.compileElement(node)
        this.compile(node)
      } else {
        // 文本节点
        this.compileText(node)
      }
    })
  }
  compileElement(node) {
    const attributes = Array.from(node.attributes)
    attributes.forEach(attribute => {
      const { name, value } = attribute
      if (this.isDirective(name)) {
        // 这是我们需要的指令v-xxx
        const dir = name.split('-')[1] // text html model on:click
        const [dirName, eventName] = dir.split(':') //[text/html/model, click]
        // 策略模式，数据驱动试图
        compileUtil[dirName](node, value, this.vm, eventName)
      } else if (this.isEventName(name)) {
        // @click="handleClick"
        let eventName = name.split('@')[1]
        compileUtil['on'](node, value, this.vm, eventName)
      } else if (this.isBindName(name)) {
        // :class="title"
        let bindName = name.split(':')[1]
        compileUtil['bind'](node, value, this.vm, bindName)
      }
      // 删除有指令的标签
      node.removeAttribute(name)
    })
  }
  compileText(node) {
    const content = node.textContent
    // 正则匹配
    if (/\{\{(.+?)\}\}/.test(content)) {
      compileUtil['text'](node, content, this.vm)
    }
  }
  isDirective(name) {
    return name.startsWith('v-')
  }
  isEventName(name) {
    return name.startsWith('@')
  }
  isBindName(name) {
    return name.startsWith(':')
  }
  nodeFragment(el) {
    // 创建文档碎片对象
    const f = document.createDocumentFragment()
    while (el.firstChild) {
      f.appendChild(el.firstChild) // appendChild会自动删除原来节点所在的位置
    }
    return f
  }
  isElementNode(node) {
    return node.nodeType === 1
  }
}

class Observer {
  constructor(data) {
    this.observe(data)
  }
  observe(data) {
    if (data && typeof data === 'object') {
      for (let k in data) {
        this.defineReactive(data, k, data[k])
      }
    }
  }
  defineReactive(data, key, value) {
    this.observe(value)
    // 每个对象都需要一个Dep订阅器
    const dep = new Dep()
    Object.defineProperty(data, key, {
      get() {
        // 订阅数据变化时，往dep（订阅器）中添加watcher
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set: (newValue) => {
        this.observe(newValue)
        if (newValue !== value) {
          value = newValue
          // 通知变化
          dep.notify()
        }
      }
    })
  }
}

class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm
    this.expr = expr
    this.cb = cb
    // 先获取旧值
    this.oldVal = this.getOldVal()
  }
  // 判断新值和旧值的变化，并更新
  update() {
    // 调用update方法时，已经是获取新值
    const newVal = compileUtil.getVal(this.expr, this.vm)
    if (newVal !== this.oldVal) {
      // 此时数据和视图不一致，调用回调函数改变视图
      this.cb(newVal)
      // 新值换成旧值
      this.oldVal = newVal
    }
  }
  // 获得旧值
  getOldVal() {
    // 在获取老值之前，就是初始化数据的时候，把一个watcher挂载到dep上
    Dep.target = this
    const oldVal = compileUtil.getVal(this.expr, this.vm)
    Dep.target = null
    return oldVal
  }
}

// Dep的作用，通知和收集依赖
class Dep {
  constructor() {
    this.subs = []
  }
  // 收集观察者
  addSub(watcher) {
    this.subs.push(watcher)
    console.log(this.subs);
  }
  // 通知观察者更新
  notify() {
    // 需要对数组遍历找到对应观察者
    console.log('通知了观察者', this.subs);
    this.subs.forEach(w => w.update())
  }
}

class MyVue {
  constructor(options) {
    this.$el = options.el
    this.$data = options.data()
    this.$options = options
    if (this.$el) { // 只有它存在的时候才实现
      // 1. 实现数据的观察者
      new Observer(this.$data)
      // 2. 实现指令解析器
      new Compile(this.$el, this)
      // 3.进行代理使data可以直接使用
      this.proxyData(this.$data)
    }
  }
  proxyData(data) {
    for (let key in data) {
      Object.defineProperty(this, key, {
        get() {
          return data[key]
        },
        set(newValue) {
          data[key] = newValue
        }
      })
    }
  }
}
```

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .MyVue {
      color: aqua;
    }

  </style>
</head>

<body>
  <div id="app">
    <h2 v-html="title" :class="title"></h2>
    <button v-on:click="handleClick">test</button>
    <button @click="handleClick">test</button>
    <div>
      <ul>
        <li>{{info.user.name}}</li>
        <li>{{info.user.age}}</li>
        <li>{{info.user.fav}}</li>
      </ul>
    </div>
    <div>
      <p v-text="msg"></p>
    </div>
    <input type="text" v-model="info.message">
    <i>{{info.message}}</i>
  </div>
  <script src="./MyVue.js"></script>
  <script>
    const vm = new MyVue({
      el: '#app',
      data() {
        return {
          info: {
            message: 'ok',
            user: {
              name: 'corgi',
              age: 18,
              fav: 'doggie'
            }
          },
          loading: true,
          title: 'MyVue',
          msg: 'haha'
        }
      },
      methods: {
        handleClick() {
          this.msg = 'ooo'
        }
      }
    })
  </script>
</body>

</html>

```



### MVVM响应式原理

---



vue.js采用数据劫持结合发布订阅模式，通过`Object.defineProperty()`来劫持各个属性的`setter`和`getter`，在数据变动时发布消息给订阅者，触发相应的监听回调。

`new MVVM()` => `Observer` => `Dep` => `Watcher` => 更新视图

`new MVVM()` => `Compile`（解析过程中要把watcher给绑定到每个位置的属性上） => 初始化视图



- 实现指令解析器`Compile`

- 实现数据监听器`Observer`

- 实现`watcher`去更新视图

- 实现`proxy`



MVVM作为绑定的入口，整合Observer，Compile，Watcher三者，通过Observer来监听model数据变化，通过Compile来解析编译模板指令，最终利用Watcher搭起Observer，Compile之间的通信桥梁，达到数据变化=>视图更新；视图交互变化=>数据model变更的双向绑定