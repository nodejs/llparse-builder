import * as assert from 'assert';

import { Span as SpanCallback } from './code';
import { Node, SpanEnd, SpanStart } from './node';

export class Span {
  private readonly startCache: Map<Node, SpanStart> = new Map();
  private readonly endCache: Map<Node, SpanEnd> = new Map();

  constructor(public readonly callback: SpanCallback) {
  }

  public start(otherwise?: Node) {
    if (otherwise !== undefined && this.startCache.has(otherwise)) {
      return this.startCache.get(otherwise)!;
    }

    const res = new SpanStart(this);
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

    const res = new SpanEnd(this);
    if (otherwise !== undefined) {
      res.otherwise(otherwise);
      this.endCache.set(otherwise, res);
    }
    return res;
  }
}
