import React from './react';
// import ReactDom from 'react-dom'
function show() {
  alert(1);
}
let element = React.createElement("h1", { class: "app", style: "color:red;font-size:100px;" }, "hello", React.createElement("button", { onClick: show }, "123"));

// console.log(element)

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
