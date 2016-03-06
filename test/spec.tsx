/// <reference path="../typings/main.d.ts" />

import * as React from 'react';
import * as TestUtils from 'react-addons-test-utils';
import {expect} from 'chai';
import * as jsdom from 'jsdom';

(global as any).document = jsdom.jsdom('<html><body><div id="root"></div></body></html>');
(global as any).window = (document as any).defaultView;

import warpgate, {alias} from '../src';

class Test extends React.Component<any, any> {

  constructor(props) {
    super(props);
    this.state = { val: props.val || 1 };
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
    return (
      <input
        ref={this.props.input}
        type="text"
        defaultValue="Hello"
        />
    );
  }
}

class SomeSmartComponent extends React.Component<any, any> {
  render() {
    return (
      <div>
        <Test {...this.props} ref={this.props.target}/>
        <Test ref={this.props.target2}/>
        </div>
    );
  }
}

const SomeHocFunctionComponent: any = props => <SomeSmartComponent {...props}/>;

class SomeHocClassComponent extends React.Component<any, any> {
  render() {
    return <SomeSmartComponent {...this.props}/>;
  }
}

class ManualBind extends React.Component<any, any> {
  componentDidMount() {
    this.props.target(this);
  }

  componentWillUnmount() {
    this.props.target(null);
  }

  getVal() {
    return this.props.val;
  }

  render() {
    return null;
  }
}

const ManualBindHocComponent: any = props => <ManualBind {...props}/>;

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

  it('should work with function components', () => {
    const wrapper = warpgate({ input: 'focus' });
    const WrappedTest = wrapper(SomeHocFunctionComponent);
    const dom: any = TestUtils.renderIntoDocument(<WrappedTest/>);
    dom.focus();
  });

  it('should pass down all props', () => {
    const wrapper = warpgate('returnValIncrement');
    const WrappedTest: any = wrapper(SomeHocFunctionComponent);
    const dom: any = TestUtils.renderIntoDocument(<WrappedTest val={5}/>);
    expect(dom.returnValIncrement()).to.be.equals(5);
    expect(dom.returnValIncrement()).to.be.equals(6);
  });

  it('should work with manual binding', () => {
    const wrapper = warpgate('getVal');
    const WrappedTest: any = wrapper(ManualBindHocComponent);
    const dom: any = TestUtils.renderIntoDocument(<WrappedTest val={6}/>);
    expect(dom.getVal()).to.be.equals(6);
  });

  describe('alias', () => {

    it('should properly alias a sinlge method', () => {
      const wrapper = warpgate(alias('returnFirstPlusSecond', 'myMethod'));
      const WrappedTest = wrapper(SomeHocClassComponent);
      const dom: any = TestUtils.renderIntoDocument(<WrappedTest/>);
      expect(dom.myMethod(3, 5)).to.be.equals(8);
    });

    it('should properly alias some methods within an array', () => {
      const wrapper = warpgate([
        alias('returnFirstPlusSecond', 'myMethod'),
        alias('returnValIncrement', 'myMethod2'),
        'return2',
      ]);
      const WrappedTest = wrapper(SomeHocClassComponent);
      const dom: any = TestUtils.renderIntoDocument(<WrappedTest/>);
      expect(dom.myMethod(3, 5)).to.be.equals(8);
      expect(dom.myMethod2()).to.be.equals(1);
      expect(dom.myMethod2()).to.be.equals(2);
      expect(dom.myMethod2()).to.be.equals(3);
      expect(dom.return2()).to.be.equals(2);
    });

    it('should properly alias methods from mutiple targets', () => {
      const wrapper = warpgate({
        target: ['returnFirstPlusSecond', alias('returnValIncrement', 'myMethod')],
        input: alias('focus', 'myFocus'),
      });
      const WrappedTest = wrapper(SomeHocClassComponent);
      const dom: any = TestUtils.renderIntoDocument(<WrappedTest/>);
      expect(dom.returnFirstPlusSecond(3, 5)).to.be.equals(8);
      expect(dom.myMethod()).to.be.equals(1);
      dom.myFocus();
    });

    it('should properly alias some common methods with different targets', () => {
      const wrapper = warpgate({
        target: [alias('returnFirstPlusSecond', 'someMethod'), alias('returnValIncrement', 'myval1')],
        target2: ['returnFirstPlusSecond', alias('returnValIncrement', 'myval2')],
      });

      const WrappedTest = wrapper(SomeHocClassComponent);
      const dom: any = TestUtils.renderIntoDocument(<WrappedTest/>);

      expect(dom.someMethod(3, 5)).to.be.equals(8);
      expect(dom.returnFirstPlusSecond(2, 7)).to.be.equals(9);

      expect(dom.myval1()).to.be.equals(1);
      expect(dom.myval1()).to.be.equals(2);

      expect(dom.myval2()).to.be.equals(1);
      expect(dom.myval2()).to.be.equals(2);

      expect(dom.myval1()).to.be.equals(3);
      expect(dom.myval1()).to.be.equals(4);

      expect(dom.myval2()).to.be.equals(3);
      expect(dom.myval2()).to.be.equals(4);
    });

    it('should properly alias the same method multiple times', () => {
      const wrapper = warpgate([
        alias('returnValIncrement', 'retval1'),
        alias('returnValIncrement', 'retval2'),
        alias('returnValIncrement', 'retval3'),
      ]);
      const WrappedTest = wrapper(SomeHocClassComponent);
      const dom: any = TestUtils.renderIntoDocument(<WrappedTest/>);
      expect(dom.retval1()).to.be.equals(1);
      expect(dom.retval3()).to.be.equals(2);
      expect(dom.retval2()).to.be.equals(3);
      expect(dom.retval1()).to.be.equals(4);
      expect(dom.retval3()).to.be.equals(5);
    });

  });

});
