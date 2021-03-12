### html及css几个面试题

1. 标签语义化

   合适的标签干合适的事情；分为块级标签（独占一行设置宽高）、行内块标签（不独占一行，能设置宽高）和行内标签（行内标签不能独占一行默认同一行排列，不能设置宽高）；display进行转换，还有none table flex grid；display: none和visibility: hidden区别，占不占位的问题；opacity和filter可以做什么； display: flex的使用，还有居中有哪些方式，响应式布局还能怎么做，那些盒子模型。

2. 盒子垂直居中的5大方案

   定位：三种; display: flex; JavaScript; display: table-cell
   CSS方案
   ```css
    html,
    body {
        height: 100vh;
        overflow: hidden;
    }
   
    .box {
        width: 100px;
        height: 50px;
    }
   
    /* 1.定位 */
    body {
        position: relative;
    }
    .box {
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -25px;
        margin-left: -50px;
    }
    /* 2.定位 */
    .box {
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
    }
    /* 3.定位 */
    .box {
        tranform: translate(-50%, -50%)
    }
    /* 4.flex */
    body {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    /* table-cell方案(需要固定宽高) */
    body {
        display: table-cell;
        vertical-align: middle;
        text-align: center;
        width: 500px;
        height: 500px;
    }
    .box {
        display: inline-block;
    }
   ```

   JS方案
   ```javascript
   let html = document.documentElement
   let winW = html.clientWidth
   let winH = html.clientHeight
   let boxW = box.offsetWidth
   let boxH = box.offsetHeight
   box.style.position = 'absolute'
   box.style.left = (winW - boxW) / 2 + 'px'
   box.style.top = (winH - boxH) / 2 + 'px'

   ```

3. 盒子模型

    包括标准盒子模型box-sizing: content-box、怪异盒子模型box-sizing: border-box、flex弹性盒子模型、columns盒子模型。
    **标准盒子模型**，width和height是content的宽和高，盒子宽高是由content + padding + margin + border，这在实际项目中会由于添加以上属性造成一些不必要的麻烦。
    **怪异盒子模型**，宽和高就是整个盒子的尺寸，写样式比较方便，适用于大部分的项目，包括boostrap，elementUI也是采用的border-box。
    **flex弹性伸缩盒子模型**，盒子中main axis主轴和cross axis交叉轴，盒子中的所有元素，可以通过justify-content和align-items控制他们的轴上的位置，这种方案常常使用在移动端的布局。
    **columns多列盒子模型**，这个很少用到。

3. 掌握几大经典布局方案

    圣杯布局
    ```html
    <body>
        <div class="container clearfix">
            <div class="center"></div>
            <div class="left"></div>
            <div class="right"></div>
        </div>
    </body>
    ```
    ```css
    body {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    .container {
        height: 100%;
        padding: 0 200px;
    }
    .left,
    .right {
        width: 200px;
        min-height: 200px;
      background-color: skyblue;
    }
    .center {
        width: 100%;
        min-height: 400px;
        background-color: pink;
    }
    .left,
    .right,
    .center {
        float: left;
    }
    .left {
        margin-left: -100%;
        position: relative;
        left: -200px;
    }
    .right {
        margin-right: -200px;
    }
    ```
    双飞翼布局
    ```html
    <body>
        <div class="clearfix">
            <div class="container">
                <div class="center"></div>
            </div>
            <div class="left"></div>
            <div class="right"></div>
        </div>
    </body>
    ```
    ```css
    body {
        height: 100%;
        overflow: hidden;
    }
    .container,
    .left,
    .right {
        float: left;
    }
    .container {
        width: 100%;
    }
    .container .center {
        margin: 0 200px;
        min-height: 400px;
        background-color: lightpink;
    }
    .left,
    .right {
        width: 200px;
        min-height: 200px;
        background-color: lightblue;
    }
    .left {
        margin-left: -100%;
    }
    .right {
        margin-left: -200px;
    }
    ```
    左右固定，中间自适应，就是使用flex盒子，这个比较简单，是当center在left和right的中间的时候使用。
    也可使用定位完成，同样比较简单。

4. 响应式布局的三大方案
    - media用于PC端和移动端采用相同的方案，在比较简单的页面上可以使用。
    - rem用于PC端和移动端两套项目。
    - flex用来实现某些响应式效果。
    - vw和vh就相当于使用百分比，但是设计师给出的设计稿需要计算。

   