/// <reference path="../typings/main.d.ts" />

import * as React from 'react';

const WARPGATE_DEFAULT_TARGET_NAME = 'target';

interface NormalMap {
  [method: string]: Array<string>;
}

export interface Target {
  (instance: any): void;
}

export interface Methods extends Array<string> { }

export interface MethodsMap {
  [method: string]: Array<string> | string;
}

export interface Wrapper {
  <P>(component: __React.ComponentClass<P>): __React.ComponentClass<P>;
}

function normalize(methods: string | string[] | MethodsMap): NormalMap {

  if (typeof methods === 'string') {
    return { [WARPGATE_DEFAULT_TARGET_NAME]: [methods] };
  }

  if (Array.isArray(methods)) {
    return { [WARPGATE_DEFAULT_TARGET_NAME]: methods };
  }

  if (methods && typeof methods === 'object') {
    for (const key in methods) {
      if (typeof methods[key] === 'string') {
        methods[key] = [methods[key]];
      }
    }
    return methods as NormalMap;
  }

  return {};
}

export default function warpgate(methods: string): Wrapper;
export default function warpgate(methods: Methods): Wrapper;
export default function warpgate(methods: MethodsMap): Wrapper;
export default function warpgate(methods: string | Methods | MethodsMap): Wrapper {

  const methodMap = normalize(methods);

  const targetNames = Object.keys(methodMap);

  const methodTarget: { [method: string]: string } = {};
  targetNames.forEach(key => methodMap[key].forEach(method => methodTarget[method] = key));

  return function wrapper(Component: __React.ComponentClass<any>) {

    class WrappedComponent extends React.Component<any, any> {

      private targets: { [name: string]: Target };

      constructor(props) {
        super(props);

        this.targets = {};
        this.state = {};

        // Create targets and pass them down
        targetNames.forEach(name => this.targets[name] = instance => this.setState({ [name]: instance }));

        // Create proxies on this component
        Object.keys(methodTarget).forEach(method => {
          const targetName = methodTarget[method];
          this[method] = (...args) => this.state[targetName][method](...args);
        });
      }

      render() {
        return <Component {...this.props} {...this.targets}/>;
      }
    }

    return WrappedComponent;
  };
}
