import * as React from 'react';

const WARPGATE_DEFAULT_TARGET_NAME = 'target';

export class MethodAlias {
  public name: string;
  public alias: string;

  constructor(method: string, alias: string) {
    this.name = method;
    this.alias = alias;
  }
}

export function alias(method: string, alias: string): MethodAlias {
  return new MethodAlias(method, alias);
}

export type Method = string | MethodAlias;

export interface MethodsMap {
  [method: string]: Method[] | Method;
}

export interface Wrapper {
  <P>(component: __React.ComponentClass<P>): __React.ComponentClass<P>;
}

interface NormalMap {
  [target: string]: MethodAlias[];
}

function normalize(methods: Method | Method[] | MethodsMap): NormalMap {

  if (methods instanceof MethodAlias) {
    return { [WARPGATE_DEFAULT_TARGET_NAME]: [methods] };
  }

  if (typeof methods === 'string') {
    return { [WARPGATE_DEFAULT_TARGET_NAME]: [alias(methods, methods)] };
  }

  if (Array.isArray(methods)) {
    const normalArray: MethodAlias[] = [];

    methods.forEach(method => {
      if (method instanceof MethodAlias) {
        normalArray.push(method);
      }
      if (typeof method === 'string') {
        normalArray.push(alias(method, method));
      }
    });

    return { [WARPGATE_DEFAULT_TARGET_NAME]: normalArray };
  }

  if (methods && typeof methods === 'object') {
    const normalMap: NormalMap = {};

    Object.keys(methods).forEach(key => {
      if (methods[key] instanceof MethodAlias) {

        normalMap[key] = [methods[key]];

      } else if (typeof methods[key] === 'string') {

        normalMap[key] = [alias(methods[key], methods[key])];

      } else if (Array.isArray(methods[key])) {

        const array: MethodAlias[] = [];

        methods[key].forEach(method => {
          if (method instanceof MethodAlias) {
            array.push(method);
          }
          if (typeof method === 'string') {
            array.push(alias(method, method));
          }
        });
        normalMap[key] = array;

      }
    });

    return normalMap;
  }

  return {};
}

export default function warpgate(methods: Method): Wrapper;
export default function warpgate(methods: Method[]): Wrapper;
export default function warpgate(methods: MethodsMap): Wrapper;
export default function warpgate(methods: Method | Method[] | MethodsMap): Wrapper {

  const methodMap = normalize(methods);

  return function wrapper(Component: __React.ComponentClass<any>) {

    class WrappedComponent extends React.Component<any, any> {

      private targets: { [name: string]: (instance: any) => void };

      constructor(props) {
        super(props);

        this.targets = {};
        this.state = {};

        // Create targets and pass them down
        Object.keys(methodMap).forEach(target => {
          this.targets[target] = instance => this.setState({ [target]: instance });
        });

        // Create proxies on this component
        Object.keys(methodMap).forEach(target => {
          const aliases = methodMap[target];

          aliases.forEach(methodAlias => {

            this[methodAlias.alias] = (...args) => {
              return this.state[target][methodAlias.name](...args);
            };

          });

        });
      }

      render() {
        return <Component {...this.props} {...this.targets}/>;
      }
    }

    return WrappedComponent;
  };
}
