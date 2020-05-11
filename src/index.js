import React from './react';
// function show() {
//   alert(1);
// }
// let element = React.createElement("h1", { class: "app" },
//   "hello", React.createElement("button", { onClick: show }, "123"));

class SubCounter {
  componentWillMount() {
    console.log("child  即将挂载");
  }
  componentDidMount() {
    console.log("child  挂载完成");
  }
  render() {
    return "123"
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
    return React.createElement(SubCounter, { name: 1 });
  }
}
{/* <Counter name="aeipyuan"></Counter> */ }
React.render(
  <Counter />,
  document.getElementById('root')
);
