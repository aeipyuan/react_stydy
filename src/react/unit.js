import $ from 'jquery'
/* 创建一个父级，放置多次重复写constructor */
class Unit {
    constructor(element) {
        this.currentElement = element;
    }
}
/* 文本单元 */
class ReactTextUnit extends Unit {
    getMarkUp(rootId) {
        /* 存rootId */
        this._rootId = rootId;
        /* <span data-reactid="0">111</span> */
        return `<span data-reactid="${rootId}">${this.currentElement}</span>`;
    }
}
/* 原生单元 */
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
/* 组件单元 */
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
/* 根据不同类型生成不同单元 */
function createReactUnit(element) {
    /* 创建文本单元 */
    if (typeof element === "string"
        || typeof element === "number") {
        return new ReactTextUnit(element);
    }
    /* 创建标签 */
    if (typeof element === "object"
        && typeof element.type === "string") {
        return new ReactNativeUnit(element);
    }
    /* 组件 */
    if (typeof element === "object"
        && typeof element.type === "function") {
        return new ReactComponent(element);
    }
}
export default createReactUnit
