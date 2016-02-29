/// <reference path="../typings/main.d.ts" />

import * as React from 'react';
import * as TestUtils from 'react-addons-test-utils';
import {expect} from 'chai';
import * as jsdom from 'jsdom';

(global as any).document = jsdom.jsdom('<html><body><div id="root"></div></body></html>');
(global as any).window = (document as any).defaultView;

import warpgate from '../src';

class Test extends React.Component<any, any> {

  constructor(props) {
    super(props);
    this.state = { val: 1 };
  }

  return2() {
    return 2;
  }

  returnFirstPlusSecond(first, second) {
    return first + second;
  }

  returnValIncrement() {
    const val = this.state.val;
    this.setState({ val: val + 1 });
    return val;
  }

  render() {
    return <input
      ref={this.props.input}
      type="text"
      defaultValue="Hello"
      />;
  }
}

class SomeSmartComponent extends React.Component<any, any> {
  render() {
    return <Test {...this.props} ref={this.props.target}/>;
  }
}

class SomeHocClassComponent extends React.Component<any, any> {
  render() {
    return React.createElement(SomeSmartComponent, this.props);
  }
}

describe('Warpgate', () => {
  it('should warp method invocation to custom components', () => {
    const wrapper = warpgate('return2');
    const WrappedTest = wrapper(SomeHocClassComponent);
    const dom: any = TestUtils.renderIntoDocument(<WrappedTest/>);
    expect(dom.return2()).to.be.equals(2);
  });

  it('should warp method invocation to native elements', () => {
    const wrapper = warpgate({ input: ['focus', 'blur', 'select', 'click'] });
    const WrappedTest = wrapper(SomeHocClassComponent);
    const dom: any = TestUtils.renderIntoDocument(<WrappedTest/>);
    dom.focus();
    dom.blur();
    dom.select();
    dom.click();
  });

  it('should properly warp arguments', () => {
    const wrapper = warpgate('returnFirstPlusSecond');
    const WrappedTest = wrapper(SomeHocClassComponent);
    const dom: any = TestUtils.renderIntoDocument(<WrappedTest/>);
    expect(dom.returnFirstPlusSecond(3, 5)).to.be.equals(8);
  });

  it('should work with multiple methods', () => {
    const wrapper = warpgate(['returnFirstPlusSecond', 'returnValIncrement']);
    const WrappedTest = wrapper(SomeHocClassComponent);
    const dom: any = TestUtils.renderIntoDocument(<WrappedTest/>);
    expect(dom.returnFirstPlusSecond(3, 5)).to.be.equals(8);
    expect(dom.returnValIncrement()).to.be.equals(1);
    expect(dom.returnValIncrement()).to.be.equals(2);
    expect(dom.returnValIncrement()).to.be.equals(3);
  });

  it('should work with mutiple targets', () => {
    const wrapper = warpgate({
      target: ['returnFirstPlusSecond', 'returnValIncrement'],
      input: 'focus',
    });
    const WrappedTest = wrapper(SomeHocClassComponent);
    const dom: any = TestUtils.renderIntoDocument(<WrappedTest/>);
    expect(dom.returnFirstPlusSecond(3, 5)).to.be.equals(8);
    expect(dom.returnValIncrement()).to.be.equals(1);
    dom.focus();
  });

  it('should work with no targets', () => {
    const wrapper = warpgate({});
    const WrappedTest = wrapper(SomeHocClassComponent);
    const dom: any = TestUtils.renderIntoDocument(<WrappedTest/>);
  });
});
