declare namespace __Warpgate {

  interface Target {
    (instance: any): void;
  }

  interface Methods extends Array<string> { }

  interface MethodsMap {
    [method: string]: Array<string> | string;
  }

  interface Wrapper {
    <P>(component: __React.ComponentClass<P>): __React.ComponentClass<P>;
  }
}

declare function __Warpgate(method: string): __Warpgate.Wrapper;
declare function __Warpgate(methods: __Warpgate.Methods): __Warpgate.Wrapper;
declare function __Warpgate(methodsMap: __Warpgate.MethodsMap): __Warpgate.Wrapper;

declare module 'react-warpgate' {
  export default __Warpgate;
}
