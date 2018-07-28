# jQuery-autocomplete

## 介绍
- jQuery联想词插件

## 使用

```javascript 
// 方法1
$('#search').autoComplete(optoin)

// 方法2
var autoCompleteInstance = new $.autoComplete(selector, optoin)
autoCompleteInstance.init()
```

## 配置介绍

```javascript
// options
{
  containerClass: 'autocomplete-container', // 外层容器的类名
  itemClass: 'autocomplete-item', // 选项的类名，这个类名会在提供的h函数中使用
  selectedItemClass: 'selected', // 选项选中的类名
  sameHeight: true, // 选项是否都是一样的高度
  debounce: 200, // 防抖的间隔时间
  onInput: function (val, h) { // 用户输入的时候触发
      // val: 用户输入的值
      // h: 插件内部的渲染函数，把选项html片段传进去，进行渲染
      data = val.split('')
      var html = '<ul>'
      data.forEach(e => {
          // 这里要把选项加上配置的itemClass
          html += '<li class="autocomplete-item">' + e + '</li>'
      })
      html += '</ul>'
      h(html)
  },
  onSelect: function (i, setVal) { // 用户上下选择、鼠标点击选项和选中项目按下回车的时候处罚
      // i: 选中的选项下标，从0开始
      // setVal: 插件内部的为input赋值函数，相当于input.value = value
      setVal(data[i])
  },
  onEnter: function (value) { // 用户按回车的时候触发
      // value: input中的内容
  }
}
```
