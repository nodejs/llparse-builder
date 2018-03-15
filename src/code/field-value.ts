import { Signature } from './base';
import { Field } from './field';

export class FieldValue extends Field {
  constructor(signature: Signature, name: string, field: string,
              public readonly value: number) {
    super(signature, name, field);
  }
}
