# 实现一个精简版React
---
## React.createElement

作用：将babel解析的结果转换成树形结构

```javascript
class Element {
    constructor(type, props) {
        this.type = type;
        this.props = props;
    }
}
function createElement(type, props, ...children) {
    props = props || {};
    props.children = children;
    return new Element(type, props);
}
export default createElement
```

转化前：

```javascript
let element = React.createElement("h1",
  { class: "app", style: "color:red;font-size:100px;" },
  "hello",
  React.createElement("button", null, "123"));
```

转化后：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9naXRlZS5jb20vYWVpcHl1YW4vcGljdHVyZV9iZWQvcmF3L21hc3Rlci9pbWFnZXMvMjAyMDA1MTIxMDU0NTIucG5n?x-oss-process=image/format,png)

## React.render

作用：渲染元素到对应位置

```javascript
/* react.js */
import $ from 'jquery'
import createElement from './element'
import createReactUnit from './unit';
import Component from './component'
/* React对象 */
let React = {
    createElement,
    render,
    nextRootIndex: 0,/* 元素编号 */
    Component
}
/* render负责将转化的element渲染到页面 */
function render(element, container) {
    /* 创建单元并编号 */
    let createReactUnitInstance = createReactUnit(element);
    let markUp = createReactUnitInstance.getMarkUp(React.nextRootIndex);
    /* 渲染到容器上 */
    $(container).html(markUp);
    /* 触发订阅函数 */
    $(document).trigger('mounted');
}
```
#### createReactUnit

createReactUnit函数负责将传入的格式化element分为三类分别处理(文本，原生元素，组件)，另外创建一个父类，减少冗余代码

```javascript
import $ from 'jquery'
/* 创建一个父类，放置多次重复写constructor */
class Unit {
    constructor(element) { this.currentElement = element;  }
}
/* 文本单元 */
class ReactTextUnit extends Unit {
    getMarkUp(rootId) {
        //...
    }
}
/* 原生单元 */
class ReactNativeUnit extends Unit {
    getMarkUp(rootId) {
        //...
    }
}
/* 组件单元 */
class ReactComponent extends Unit {
    getMarkUp(rootId) {
        //...
    }
}
/* 根据不同类型生成不同单元 */
function createReactUnit(element) {
    /* 创建文本单元 */
    if (typeof element === "string" || typeof element === "number") {
        return new ReactTextUnit(element);
    }
    /* 创建标签 */
    if (typeof element === "object" && typeof element.type === "string") {
        return new ReactNativeUnit(element);
    }
    /* 组件 */
    if (typeof element === "object"  && typeof element.type === "function") {
        return new ReactComponent(element);
    }
}
export default createReactUnit
```
1. 文本     
直接在用`span`包围并记录`data-reactid`
```javascript
class ReactTextUnit extends Unit {
    getMarkUp(rootId) {
        /* 存rootId */
        this._rootId = rootId;
        /* <span data-reactid="0">111</span> */
        return `<span data-reactid="${rootId}">${this.currentElement}</span>`;
    }
}
```
2. 原生标签     
通过字符串拼接的方式连接属性，对于`children`，通过递归的方式创建子单元，用一个字符串`content`来存生成的标签字符串，对于`onClick`等事件绑定，使用`$(document).on()`绑定事件解决字符串无法绑定的问题

```javascript
class ReactNativeUnit extends Unit {
    getMarkUp(rootId) {
        this._rootId = rootId;
        /* 提取数据 */
        let { type, props } = this.currentElement;
        /* 创建外围标签 */
        let tagStart = `<${type} data-reactid=${rootId}`, tagEnd = `</${type}>`;
        /* 遍历标签属性 */
        let content = "";
        for (let key in props) {
            /* 儿子结点 */
            if (key === "children") {
                content += props[key].map((child, index) => {
                    let childUnit = createReactUnit(child);
                    return childUnit.getMarkUp(`${rootId}.${index}`)
                }).join('');
            }
            /* {onClick:show} 事件 */
            else if (/^on[A-Z]/.test(key)) {
                /* 绑定事件 */
                let eventType = key.slice(2).toLowerCase();
                $(document).on(eventType, `[data-reactid="${rootId}"]`, props[key]);
            }
            /* 普通属性 */
            else
                tagStart += ` ${key}="${props[key]}" `;
        }
        /* 拼接返回 */
        return `${tagStart}>${content}${tagEnd}`;
    }
}
```
传入element
```html
(
<h1 class="app" style="color:red;font-size:100px;">
    hello
    <button onClick={show}>123</button>
</h1>
)
```

效果

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9naXRlZS5jb20vYWVpcHl1YW4vcGljdHVyZV9iZWQvcmF3L21hc3Rlci9pbWFnZXMvMjAyMDA1MTIxMzIwMTgucG5n?x-oss-process=image/format,png)

3. 组件
`babel`解析组件的结果第一个值是`Counter`类，调用`createElement`后赋值到`type`上，生成单元时可以通过`type`获取到`Counter`,然后新建实例获得类中`render`方法的结果，对结果进行创建单元和调用`getMarkUp`方法，得到标签字符串`markUp`并返回，另外还可以通过创建实例的方式获取生命周期函数，组件挂载前直接调用，页面挂载后通过`$(document).trigger('mounted')`触发执行
```javascript
组件jsx格式：
<Counter name="mike"/>
解析结果：
React.createElement(Counter, {
  name: "mike"
});
```
```javascript
class ReactComponent extends Unit {
    getMarkUp(rootId) {
        this._rootId = rootId;
        /* 获取到Conponent类 */
        let { type: Component, props } = this.currentElement;
        let componentInstance = new Component(props);
        /* 挂载前生命周期函数 */
        componentInstance.componentWillMount &&
            componentInstance.componentWillMount();
        // 获取实例render返回值
        let element = componentInstance.render();
        let markUp = createReactUnit(element).getMarkUp(rootId);
        /* 挂载后生命周期 */
        $(document).on('mounted', () => {
            componentInstance.componentDidMount &&
                componentInstance.componentDidMount();
        });
        return markUp;
    }
}
```
示例：
```javascript
class SubCounter {
  componentWillMount() {
    console.log("child  即将挂载");
  }
  componentDidMount() {
    console.log("child  挂载完成");
  }
  render() {
    return <h1 style="color:green" onClick={show}>888</h1>
  }
}
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 1 }
  }
  componentWillMount() {
    console.log("parent  即将挂载");
  }
  componentDidMount() {
    console.log("parent  挂载完成")
  }
  render() {
    return <SubCounter />;
  }
}
React.render(
  <Counter name="mike" />,
  document.getElementById('root')
);
```
效果：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9naXRlZS5jb20vYWVpcHl1YW4vcGljdHVyZV9iZWQvcmF3L21hc3Rlci9pbWFnZXMvMjAyMDA1MTIxMzQxMDAucG5n?x-oss-process=image/format,png)