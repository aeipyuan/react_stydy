import $ from 'jquery'
class Unit {
  constructor(element) {
    this.currentElement = element;
  }
}
class ReactTextUnit extends Unit {
  getMarkUp(rootId) {
    this._rootId = rootId;
    /* 返回dom */
    return `<span data-reactid=${rootId}>${this.currentElement}</span>`
  }
}
class ReactNativeUnit extends Unit {
  getMarkUp(rootId) {
    this._rootId = rootId;
    /* 创建标签字符串 */
    let { type, props } = this.currentElement;
    let tagStart = `<${type} data-reactid="${rootId}"`;
    let tagEnd = `</ ${type}>`;
    /* 内部元素 */
    let content = '';
    for (let propName in props) {
      /* 绑定事件 */
      if (/^on[A-Z]/.test(propName)) {
        let eventType = propName.slice(2).toLowerCase();
        $(document).on(eventType, `[data-reactid="${rootId}"]`, props[propName]);
      }
      /* 子元素 */
      else if (propName === 'children') {
        content += props[propName].map((child, index) => {
          let childInstance = CreateReactUnit(child);
          return childInstance.getMarkUp(`${rootId}.${index}`)
        }).join('');
      }
      /* 文本 */
      else {
        tagStart += ` ${propName}=${props[propName]} `;
      }
    }
    return tagStart + '>' + content + tagEnd;
  }
}
class ReactComponent extends Unit {
  getMarkUp(rootId) {
    this._rootId = rootId;
    let { type: Component, props } = this.currentElement;
    let componentInstance = new Component(props);
    /* 执行生命周期函数 */
    componentInstance.componentWillMount && componentInstance.componentWillMount();
    /* 返回render结果 */
    let reactCompomentRender = CreateReactUnit(componentInstance.render());
    let markup = reactCompomentRender.getMarkUp(rootId);
    /* 订阅 */
    $(document).on('mounted', () => {
      componentInstance.componentDidMount && componentInstance.componentDidMount()
    })
    return markup;
  }
}
function CreateReactUnit(element) {
  if (typeof element === "string" ||
    typeof element === "number") {
    return new ReactTextUnit(element);
  }
  if (typeof element === "object"
    && typeof element.type === "string") {
    return new ReactNativeUnit(element);
  }
  if (typeof element == "object"
    && typeof element.type == "function") {
    return new ReactComponent(element);
  }
}

export default CreateReactUnit;