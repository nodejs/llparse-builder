import { Code, Signature } from './base';

export class Field extends Code {
  constructor(signature: Signature, name: string,
              public readonly field: string) {
    super(signature, name + '_' + field);
  }
}
