import { Span } from '../span';
import { Node } from './base';

/**
 * Indicates span start.
 *
 * See `SpanEnd` for details on callback invocation.
 */
export class SpanStart extends Node {
  /**
   * @param span  Span instance
   */
  constructor(public readonly span: Span) {
    super(`span_start_${span.callback.name}`);
  }
}
