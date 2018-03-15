import * as assert from 'assert';

import { Code } from '../code';
import { Edge } from '../edge';
import { Node } from './base';

export interface IInvokeMap {
  [key: number]: Node;
}

export class Invoke extends Node {
  constructor(public readonly code: Code, map: IInvokeMap) {
    super('invoke_' + code.name);

    Object.keys(map).forEach((mapKey) => {
      const numKey: number = parseInt(mapKey, 10);
      const targetNode = map[numKey]!;

      assert.strictEqual(numKey, numKey | 0,
        'Invoke\'s map keys must be integers');

      this.addEdge(new Edge(targetNode, true, numKey, undefined));
    });
  }
}
