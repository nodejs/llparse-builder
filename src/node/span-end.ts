import { Code } from '../code';
import { Node } from './base';

export class SpanEnd extends Node {
  constructor(public readonly span: any, public readonly code: Code) {
    super(`span_end_${code.name}`);
  }
}
