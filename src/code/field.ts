import * as assert from 'assert';
import { Code, Signature } from './base';

export abstract class Field extends Code {
  constructor(signature: Signature, name: string,
              public readonly field: string) {
    super(signature, name + '_' + field);
    assert(!/^_/.test(field), 'Can\'t access internal field from user code');
  }
}
