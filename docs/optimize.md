懒加载
---
**1. 懒加载是什么**

  懒加载在前端网页中十分常见，也叫做延迟加载，即用户在浏览网页时，页面的资源随用户所需而加载。最常见的就是图片资源的懒加载，未进入可视区域的图片并不加载，而随着页面滚动条的下拉，进入可视区域的图片才加载。总之，懒加载体现着一种对资源按需索取的概念。

**2. 懒加载的优势**

  1. 懒加载可以提高web页面的性能，对资源不一定完全加载，减轻服务器的负担。
  2. 减少用户等待资源的时间，用户不要再为了等待所有页面资源加载完毕，再获取web服务。
  3. 减轻页面加载资源过多所带来的JS阻塞。
  4. 减少不必要资源加载的流量浪费

**3. 懒加载代码的实现**

  懒加载代码的主要原理是通过监听滚动条的`scroll`事件，触发事件监听函数，在事件监听函数中依次对页面上的`img`元素进行判断，是否处在当前可视区域中？若是，则将`data-src`属性赋值给`src`属性，并删除`data-src`属性。
  判断是否处于可视区域中，是通过比较当前页面的高度和`img`元素的`offsetTop`属性或`getBoundingClientRect().top`属性，它们有些许不同，尽量使用后者。使用防抖`debounce`而不是节流`throttle`是因为需要最后一次操作有效，忽略中间不必要的滚动带来的资源加载。

  ```html
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>懒加载</title>
    <style>
      body {
        width: 100%;
      }

      #lazy-load {
        width: 400px;
        margin: auto;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
      }

      #lazy-load img {
        width: 300px;
        height: 400px;
        border: 1px solid #203040;
      }

    </style>
  </head>

  <body>
    <div id="lazy-load">
      <img src="" data-src="./images/p1.jpg">
      <img src="" data-src="./images/p2.jpg">
      <img src="" data-src="./images/p3.jpg">
      <img src="" data-src="./images/p4.jpg">
      <img src="" data-src="./images/p5.jpg">
      <img src="" data-src="./images/p6.jpg">
    </div>
    <script>
      class LazyLoad {
        constructor() {
          this.windowHeight = window.innerHeight
          this.imgs = document.getElementsByTagName('img')
          // 初始化
          this.loadPic()
          this.listenScroll()
        }
        getElementTop(element) {
          return element.getBoundingClientRect().top
        }
        // 加载图片(替换src)
        loadPic() {
          let imgs = this.imgs
          for (let i = 0; i < this.imgs.length; i++) {
            if (this.getElementTop(imgs[i]) < this.windowHeight) {
              let src = imgs[i].getAttribute('data-src')
              if (src) {
                imgs[i].removeAttribute('data-src')
                imgs[i].setAttribute('src', src)
              }
            }
          }
        }
        // 监听Scroll事件
        listenScroll() {
          window.addEventListener(
            'scroll',
            this.debounce(this.loadPic, 200)
          )
        }
        // 防抖函数
        debounce(fn, ms) {
          let timer = null
          return () => {
            clearTimeout(timer)
            timer = setTimeout(fn.bind(this), ms)
          }
        }
      }
      new LazyLoad()
    </script>
  </body>

  </html>

  ```

