import { Span } from '../code';
import { Node } from './base';

export class SpanEnd extends Node {
  constructor(public readonly span: any, public readonly callback: Span) {
    super(`span_end_${callback.name}`);
  }
}
