# [React Warpgate](https://github.com/alitaheri/react-warpgate)
[![npm](https://badge.fury.io/js/react-warpgate.svg)](https://badge.fury.io/js/react-warpgate)
[![Build Status](https://travis-ci.org/alitaheri/react-warpgate.svg?branch=master)](https://travis-ci.org/alitaheri/react-warpgate)

This tiny decorator wraps a component tree and warps the imperative method calls down the chain.
It uses the React's `ref` callback feature.

To use this package you would need to be fairly familiar with
[React](http://facebook.github.io/react/) itself and its
[ref](https://facebook.github.io/react/docs/more-about-refs.html) feature. 

## Installation

You can install this package with the following command:

```sh
npm install react-warpgate
```

## Examples

These examples demonstrate how you can use this library:

### Simple Usage

You can pass warpgate a single method name and it will warp that.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import warpgate from 'react-warpgate';

// "target" is the default function prop warpgate passes down.
const TextBox = ({target, style}) => <input type="text" ref={target} style={style} />;

// There is no way to access the input nested inside the div and call focus on it.
const CuteTextBox = (props) => <div><TextBox {...props} style={{color: 'pink'}}/></div>;

// warpgate to rescue!
const WarpedCuteTextBox = warpgate('focus')(CuteTextBox);

// Now you can do this:
const instance = ReactDOM(<WarpedCuteTextBox />, document.getElementById('container'));
instance.focus();
```

Please note that, calling these methods on unmounted elements is an error and will throw.

### Manual Binding

In case you wish to bind target without having to use ref you can manually bind
the target to your component.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import warpgate from 'react-warpgate';

class ManuallyBoundComponent extends React.Component<any, any> {
  componentDidMount() {
    this.props.target(this);
  }

  componentWillUnmount() {
    this.props.target(null);
  }

  focus() {
    // Some loigc to manage focus.
    this.refs.input.focus();
  }

  render() {
    return <input type="text" ref="input" />;
  }
}

const WarpedManuallyBoundComponent = warpgate('focus')(CuteTextBox);

const instance = ReactDOM(<WarpedManuallyBoundComponent />, document.getElementById('container'));
// Calls ManuallyBoundComponent's focus.
instance.focus();
```

Make sure you call target with `null` in `componentWillUnmount` or you'll have memory leak.

### Multiple Methods

You can use warpgate to warp more than one function.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import warpgate from 'react-warpgate';

const TextBox = ({target, style}) => <input type="text" ref={target} style={style} />;
const CuteTextBox = (props) => <div><TextBox {...props} style={{color: 'pink'}}/></div>;

const WarpedCuteTextBox = warpgate(['focus', 'blur', 'click', 'select'])(CuteTextBox);

const instance = ReactDOM(<WarpedCuteTextBox />, document.getElementById('container'));
instance.focus();
instance.blur();
instance.click();
instance.select();
```

### Multiple Targets

You can use warpgate to warp more than one function, or for more than one target.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import warpgate from 'react-warpgate';

const TextBox = ({target, style}) => <input type="text" ref={target} style={style} />;

class MyComponent extends React.Component {
  sayHello() {
    alert('hello');
  }

  render() {
    return this.props.children;
  }
}

const CuteTextBox = (props) => (
  <MyComponent ref={props.myTarget}>
    <TextBox {...props} style={{color: 'pink'}}/>
  </MyComponent>
);

const WarpedCuteTextBox = warpgate({
  target: ['focus', 'blur', 'click', 'select'],
  myTarget: 'sayHello',
})(CuteTextBox);

const instance = ReactDOM(<WarpedCuteTextBox />, document.getElementById('container'));
// Called on the input element.
instance.focus();
instance.blur();
instance.click();
instance.select();
// Called on MyComponent.
instance.sayHello();
```

### Alias

To warp common methods from multiple targets it is possible to alias methods.
This can also be useful to provide compatibility when renaming methods since
many aliases can point to the same method. To alias a method simple import `alias`
and put `alias(method: string, alias: string)` wherever you would normally
put a method name.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import warpgate, {alias} from 'react-warpgate';

class MultiTargetComponent extends React.Component {
  sayHello() {
    alert('hello');
  }

  render() {
    return (
      <div>
        <input ref={this.props.target1} type="text"/>
        <input ref={this.props.target2} type="text"/>
      </div> 
    );
  }
}

const SomeHOC = (props) => <MultiTargetComponent {...props}/>;

const WarpedSomeHOC = warpgate({
  target1: [
    'focus',
    'blur',
    alias('click', 'clickFirst'),
    alias('click', 'clickMe'),
    'select',
  ],
  target2: alias('focus', 'focusSecond'),
})(SomeHOC);

// Also possible: 
// warpgate(alias('click', 'tap'))
// warpgate(['focus', alias('select', 'selectMe')])

const instance = ReactDOM(<WarpedSomeHOC />, document.getElementById('container'));

// All called on the first input.
instance.focus();
instance.blur();
// Both will call click on the first input.
instance.clickFirst();
instance.clickMe();
// Called on the second input.
instance.focusSecond();
```

## Typings

The typescript type definitions are also available and are installed via npm.

## License
This project is licensed under the [MIT license](https://github.com/alitaheri/react-warpgate/blob/master/LICENSE).
