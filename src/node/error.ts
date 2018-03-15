import * as assert from 'assert';
import { Node } from './base';

class NodeError extends Node {
  constructor(public readonly code: number, public readonly reason: string) {
    super('error');
    assert.strictEqual(code, code | 0, 'code must be integer');
  }

  public otherwise(node: Node): this { throw new Error('Not supported'); }
  public skipTo(node: Node): this { throw new Error('Not supported'); }
}

export { NodeError as Error };
