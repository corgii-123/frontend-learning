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

### 跨域的解决方案和实现原理

1. JSONP：通过script标签引用cdn标签，获取get请求。缺点：不安全GET请求，不安全，大小限制，还需要服务器配合。
2. iframe：window.name, document.domain, location.hash, post.message。缺点：有域的限制，必须主域相同。
3. CORS跨域资源共享：
服务端配置，比如express
```javascript
app.use((req, res, next) => {
  // 所有源都允许，但是不能携带cookie，所以一般不会设置所有源
  res.header('Access-Control-Allow-Origin', '*') 
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Credentials', 'PUT, POST, GET")
  res.header('Access-Control-Allow-Methods', 'Content-Type,Content-Length, Authorization')
  // 试探性请求，浏览器先发出来，服务器可以回复一个成功
  req.method === 'OPTION' ? res.send()
})
```
4. http proxy实现，比如正向代理和反向代理。

### cookie和session
服务器设置好session，返回给客户端的信息中会在响应头中携带`set-cookie='connext.sid'`，客户端把信息种植到本地的cookie中。客户端再次向服务器发送请求的时候，会默认在请求头中cookie把`connext.sid`传递给服务器
