CSS grid布局
---

**1. container上的属性**

  * grid-template-columns和grid-template-rows分别是列和行的声明，定义了其长度和个数；其中可以使用repeat()函数；可以使用新的尺寸单位fr进行分配；auto-fill这里用于不知晓container尺寸的情况下使用item自动填充。
  * grid-template-area可以直接命名item，并进行排列，直观又方便。
  * gap/column-gap、row-gap决定了item之间的gap，试了下，和在item中定义border是有相同作用的。
  * grid-auto-rows和grid-auto-columns用来对多余的item的尺寸进行确定
  * grid-auto-flow定义item是怎么排列的，横向还是竖向。
  * justify/align-items、justify/align-content中items表示对每个item在其grid中的操作，content对container下的content进行操作。

**2. 在item上的属性**

  * grid-column/row: a/b; 表示该item跨越了从a至b尺寸。
  * grid-column-start: span a; 和上面的作用类似，表示从当前位置跨越了a个item。
  * justify-self定义自己的对齐方式。
  * grid-area和父元素的grid-template-area对应，命名当前的item。

`html`
```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grid Layer</title>
  <link rel="stylesheet" href="./grid.css" />
</head>

<body>
  <div class="main">
    <div class="item item-1">1</div>
    <div class="item item-2">2</div>
    <div class="item item-3">3</div>
    <div class="item item-4">4</div>
    <div class="item item-5">5</div>
    <div class="item item-6">6</div>
    <div class="item item-7">7</div>
    <div class="item item-8">8</div>
    <div class="item item-9">9</div>
    <div class="item item-10">10</div>
  </div>
</body>

</html>
```
`css`
```css
.main {
  display: grid;
  width: 600px;
  height: 600px;
  border: 10px solid skyblue;
  /* grid-template-columns: repeat(auto-fill, 100px); */
  grid-template-columns: [c1] 100px [c2] 100px [c3] 100px [c4];
  grid-template-rows: 100px 100px 100px;
  /* 定义gap间距 */
  column-gap: 1px;
  row-gap: 1px;
  grid-template-areas: 
  'a a a'
  'b b b'
  'c c c';
  /* 定义排列方向 */
  grid-auto-flow: row;
  /* 在自己的网格中对齐 相当于place-items */
  justify-items: stretch;
  align-items: stretch;
  /* content内容的对齐方式 */
  justify-content: center;
  align-content: center;
  /* 定义多出来的格子 */
  grid-auto-rows: 100px;
}

.item {
  font-size: 50px;
  background-color: orange;
  color: #fff;
  text-align: center;
}

.item-1{
  /* 定义该项占用的网格 */
  /* grid-column-start: 1;
  grid-column-end: 3; */
  grid-column: 1 / 3;
  grid-row: 3 / 4;
}

.item-2 {
  /* 从哪里开始跨越几个 */
  grid-column-start: span 2;
  /* 可以定义自己的对齐方式 */
  justify-self: center;
}

.item-3 {
  /* 分配区域 */
  grid-area: b;
}
```