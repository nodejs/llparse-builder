import * as assert from 'assert';

import { Node } from './base';

export class Int extends Node {
  /**
   * @param field  State's property name
   */
  constructor(public readonly field: string, public readonly bytes: number, public readonly signed: boolean, public readonly littleEndian: boolean) {
    super(field + '_' + (signed ? 'int' : 'uint') + '_' + (bytes * 8) + (bytes > 1 ? '_' + (littleEndian ? 'le' : 'be') : ''));

    if (/^_/.test(field)) {
      throw new Error(`Can't use internal field in \`Int\`: "${field}"`);
    }
  }
}
