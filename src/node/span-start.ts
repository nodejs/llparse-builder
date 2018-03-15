import { Code } from '../code';
import { Node } from './base';

export class SpanStart extends Node {
  constructor(public readonly span: any, public readonly callback: Code) {
    super(`span_start_${callback.name}`);
  }
}
