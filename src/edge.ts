import * as assert from 'assert';

import { Buffer } from 'buffer';
import { Invoke, Node } from './node';

export class Edge {
  public static compare(a: Edge, b: Edge): number {
    if (typeof a.key === 'number') {
      return a.key - (b.key as number);
    }
    return a.key!.compare(b.key as Buffer);
  }

  constructor(public readonly node: Node,
              public readonly noAdvance: boolean,
              public readonly key: Buffer | number | undefined,
              public readonly value: number | undefined) {
    if (node instanceof Invoke) {
      if (value === undefined) {
        assert.strictEqual(node.code.signature, 'match',
          'Invalid Invoke\'s code signature');
      } else {
        assert.strictEqual(node.code.signature, 'value',
          'Invalid Invoke\'s code signature');
      }
    } else {
      assert.strictEqual(value, undefined,
        'Attempting to pass value to non-Invoke node');
    }
  }
}
