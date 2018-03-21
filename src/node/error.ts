import * as assert from 'assert';
import { Node } from './base';

/**
 * This node terminates the execution with an error
 */
class NodeError extends Node {
  /**
   * @param code    Error code to return to user
   * @param reason  Error description to store in parser's state
   */
  constructor(public readonly code: number, public readonly reason: string) {
    super('error');
    assert.strictEqual(code, code | 0, 'code must be integer');
  }

  /** `.otherwise()` is not supported on this type of node */
  public otherwise(node: Node): this { throw new Error('Not supported'); }

  /** `.skipTo()` is not supported on this type of node */
  public skipTo(node: Node): this { throw new Error('Not supported'); }
}

export { NodeError as Error };
