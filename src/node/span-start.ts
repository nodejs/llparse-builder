import { Span } from '../span';
import { Node } from './base';

export class SpanStart extends Node {
  constructor(public readonly span: Span) {
    super(`span_start_${span.callback.name}`);
  }
}
