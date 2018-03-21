import * as assert from 'assert';

import { Buffer } from 'buffer';
import { Invoke, Node } from './node';

/**
 * This class represents an edge in the parser graph.
 */
export class Edge {
  /**
   * Comparator for `.sort()` function.
   */
  public static compare(a: Edge, b: Edge): number {
    if (typeof a.key === 'number') {
      return a.key - (b.key as number);
    }
    return a.key!.compare(b.key as Buffer);
  }

  /**
   * @param node       Edge target
   * @param noAdvance  If `true` - the parent should not consume bytes before
   *                   moving to the target `node`
   * @param key        `Buffer` for `node.Match`, `number` for `node.Invoke`,
   *                   `undefined` for edges created with `.otherwise()`
   * @param value      `.select()` value associated with the edge
   */
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

    if (Buffer.isBuffer(key)) {
      assert(key.length > 0, 'Invalid edge buffer length');

      if (noAdvance) {
        assert.strictEqual(key.length, 1,
          'Only 1-char keys are allowed in `noAdvance` edges');
      }
    }
  }
}
