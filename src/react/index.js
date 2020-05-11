import $ from 'jquery'
import createReactUnit from './unit.js'
import createElement from './element.js'
import Component from './component'
let React = {
    render,
    nextRootIndex: 0,
    createElement,
    Component
}
function render(element, container) {
    let createReactUnitInstance = createReactUnit(element);
    let makeUp = createReactUnitInstance.getMarkUp(React.nextRootIndex);
    $(container).html(makeUp);
    /* 发布订阅 */
    $(document).trigger('mounted');
}
export default React;