import { Span } from '../span';
import { Node } from './base';

/**
 * Indicates span end.
 *
 * A callback will be invoked with all input data since the most recent of:
 *
 * * Span start invocation
 * * Parser execution
 */
export class SpanEnd extends Node {
  /**
   * @param span  Span instance
   */
  constructor(public readonly span: Span) {
    super(`span_end_${span.callback.name}`);
  }
}
