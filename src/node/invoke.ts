import * as assert from 'assert';

import { Code } from '../code';
import { Edge } from '../edge';
import { Node } from './base';

/**
 * Map of return codes of the callback. Each key is a return code,
 * value is the target node that must be executed upon getting such return code.
 */
export interface IInvokeMap {
  readonly [key: number]: Node;
}

/**
 * This node invokes either external callback or intrinsic code and passes the
 * execution to either a target from a `map` (if the return code matches one of
 * registered in it), or to `otherwise` node.
 */
export class Invoke extends Node {
  /**
   * @param code  External callback or intrinsic code. Can be created with
   *              `builder.code.*()` methods.
   * @param map   Map from callback return codes to target nodes
   */
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
