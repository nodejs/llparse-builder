import * as assert from 'assert';
import { Node } from './base';

/**
 * This returns the specified error code, but makes the resumption to
 * `otherwise` target possible.
 */
export class Pause extends Node {
  /**
   * @param code    Error code to return
   * @param reason  Error description
   */
  constructor(public readonly code: number, public readonly reason: string) {
    super('pause');
    assert.strictEqual(code, code | 0, 'code must be integer');
  }

  /**
   * `.skipTo()` is not supported on this type of node, please use
   * `.otherwise()`
   */
  public skipTo(node: Node): this {
    throw new Error('Not supported, please use `pause.otherwise()`');
  }
}
