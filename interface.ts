export interface IFunction<T = any> {
    (x?: any): T;
  }
  
  export interface IObject<T = any> {
    [key: string]: T;
  }