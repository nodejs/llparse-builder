import { Code } from '../code';
import { Node } from './base';

export class SpanStart extends Node {
  constructor(public readonly span: any, public readonly code: Code) {
    super(`span_start_${code.name}`);
  }
}
