import * as assert from 'assert';

import { Node } from './base';

function buildName(field: string, bytes: number, signed: boolean, littleEndian: boolean) {
  const type = signed ? 'int' : 'uint';
  const bits = bytes * 8;
  const endianness = littleEndian ? 'le' : 'be';

  if (bytes > 1) {
    return `${field}_${type}_${bits}_${endianness}`;
  } else {
    return `${field}_${type}_${bits}`;
  }
}

export class Int extends Node {
  /**
   * @param field  State's property name
   */
  constructor(public readonly field: string, public readonly bytes: number, public readonly signed: boolean, public readonly littleEndian: boolean) {
    super(buildName(field, bytes, signed, littleEndian));

    if (/^_/.test(field)) {
      throw new Error(`Can't use internal field in \`Int\`: "${field}"`);
    }
  }
}
