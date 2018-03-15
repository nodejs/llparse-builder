import { Span } from '../span';
import { Node } from './base';

export class SpanEnd extends Node {
  constructor(public readonly span: Span) {
    super(`span_end_${span.callback.name}`);
  }
}
