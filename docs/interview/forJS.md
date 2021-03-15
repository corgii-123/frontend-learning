JS的几个面试题
---

### 深克隆和浅克隆

  深克隆不能使用JSON.stringify(obj)， 因为函数、正则和日期会被变成空。

  **浅拷贝**
  ```javascript
  function shallow(obj1) {
  // 如果为null
  if(!obj1) return null
  let obj2 = {}
  for(let key in obj1) {
    // 是否为私有属性
    if(!obj1.hasOwnProperty(key)) continue
    obj2[key] = obj1[key]
  }
  return obj2
  }
  ```

  **深拷贝**
  ```javascript
  // 忽略正则、函数、日期 
  JSON.parse(JSON.stringify(obj))
  ```
  ```javascript
  function deep(obj) {
  if(obj === null) return null
  // 这一步还可以继续充实
  if(typeof obj !== 'object') return obj
  if(obj instanceof RegExp) {
    return new RegExp(obj)
  }
  if(obj instanceof Date) {
    return new Date(obj)
  }
  // 用类来创建新对象
  let newObj = new obj.constructor()
  for(let key in obj) {
    if(obj.hasOwnProperty(key)) {
      newObj[key] = deep(obj[key])
    }
  }
  return newObj
}
  ```

### 数组扁平化

**方法一**
数组扁平化方法ES6: flat(Infinity)
```javascript
const arr = [[1,[1,[2,[3]]]], 1, [2, 3, 4, [4, 5, 6]]]
console.log(arr.flat(Infinity))
```

**方法二**
转换为字符串toString或JSONstringify方法
```javascript
arr = arr.toString().split(',').map(item => Number(item))
arr = JSON.stringify(arr).replace(/\[|\]/g, '').split(',').map(item => Number(item))
```

**方法三**
循环验证是否内部有数组
```javascript
while(arr.some(item => Array.isArray(item))) {
  arr = [].concat(...arr)
}
```

**方法四**
使用递归调用，实现flat方法，这个比较熟悉不再赘述。


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

