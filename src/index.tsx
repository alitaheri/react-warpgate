/// <reference path="../typings/main.d.ts" />
/// <reference path="../typings.d.ts" />

import * as React from 'react';

const WARPGATE_DEFAULT_TARGET_NAME = 'target';

interface NormalMap {
  [method: string]: Array<string>;
}

function normalize(methods: string | string[] | __Warpgate.MethodsMap): NormalMap {

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

export default function warpgate(methods: string | string[] | __Warpgate.MethodsMap): __Warpgate.Wrapper {

  const methodMap = normalize(methods);

  const targetNames = Object.keys(methodMap);

  const methodTarget: { [method: string]: string } = {};
  targetNames.forEach(key => methodMap[key].forEach(method => methodTarget[method] = key));

  return function wrapper<P>(Component: __React.ComponentClass<P>) {

    class WrappedComponent extends React.Component<any, any> {

      private targets: { [name: string]: __Warpgate.Target };

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
