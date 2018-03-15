import * as assert from 'assert';
import { Node } from './base';

export class Pause extends Node {
  constructor(public readonly code: number, public readonly reason: string) {
    super('pause');
    assert.strictEqual(code, code | 0, 'code must be integer');
  }

  public otherwise(node: Node): this { throw new Error('Not supported'); }
  public skipTo(node: Node): this { throw new Error('Not supported'); }
}
