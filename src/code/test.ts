import { FieldValue } from './field-value';

export class Test extends FieldValue {
  constructor(field: string, value: number) {
    super('match', 'test', field, value);
  }
}
