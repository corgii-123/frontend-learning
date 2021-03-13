JS的几个面试题
---

1. 深克隆和浅克隆

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

