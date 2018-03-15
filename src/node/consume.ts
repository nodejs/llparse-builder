import * as assert from 'assert';
import { Node } from './base';

export class Consume extends Node {
  constructor(public readonly field: string) {
    super('consume_' + field);

    if (/^_/.test(name)) {
      throw new Error(`Can't use internal field in \`consume()\`: "${field}"`);
    }
  }
}
