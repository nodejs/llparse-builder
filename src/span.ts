import * as assert from 'assert';

import { Code } from './code';
import { Node, SpanEnd, SpanStart } from './node';

export class Span {
  private readonly startCache: Map<Node, SpanStart> = new Map();
  private readonly endCache: Map<Node, SpanEnd> = new Map();

  constructor(private readonly code: Code) {
  }

  public start(otherwise?: Node) {
    if (otherwise !== undefined && this.startCache.has(otherwise)) {
      return this.startCache.get(otherwise)!;
    }

    const res = new SpanStart(this, this.code);
    if (otherwise !== undefined) {
      res.otherwise(otherwise);
      this.startCache.set(otherwise, res);
    }
    return res;
  }

  public end(otherwise?: Node) {
    if (otherwise !== undefined && this.endCache.has(otherwise)) {
      return this.endCache.get(otherwise)!;
    }

    const res = new SpanEnd(this, this.code);
    if (otherwise !== undefined) {
      res.otherwise(otherwise);
      this.endCache.set(otherwise, res);
    }
    return res;
  }
}
