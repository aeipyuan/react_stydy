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
export default React
