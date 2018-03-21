import * as assert from 'assert';

import { Span as SpanCallback } from './code';
import { Node, SpanEnd, SpanStart } from './node';

/**
 * Spans are used for notifying parser user about matched data. Each byte after
 * span start will be sent to the span callback until span end is called.
 */
export class Span {
  private readonly startCache: Map<Node, SpanStart> = new Map();
  private readonly endCache: Map<Node, SpanEnd> = new Map();

  /**
   * @param callback  External callback, must be `code.span(...)` result.
   */
  constructor(public readonly callback: SpanCallback) {
  }

  /**
   * Create `SpanStart` that indicates the start of the span.
   *
   * @param otherwise Optional convenience value. Same as calling
   *                  `span.start().otherwise(...)`
   */
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

  /**
   * Create `SpanEnd` that indicates the end of the span.
   *
   * @param otherwise Optional convenience value. Same as calling
   *                  `span.end().otherwise(...)`
   */
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
