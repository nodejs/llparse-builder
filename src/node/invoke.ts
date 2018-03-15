import { Code } from '../code';
import { Node } from './base';

export interface IInvokeMap {
  [key: number]: Node;
}

export class Invoke extends Node {
  constructor(public readonly code: Code, public readonly map: IInvokeMap) {
    super('invoke_' + code.name);
  }
}
