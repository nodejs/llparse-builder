import { FieldValue } from './field-value';

export class And extends FieldValue {
  constructor(field: string, value: number) {
    super('match', 'and', field, value);
  }
}
