import { Field } from './field';

export interface IMulAddOptions {
  readonly base: number;
  readonly max?: number;
  readonly signed?: boolean;
}

export class MulAdd extends Field {
  constructor(field: string, public readonly options: IMulAddOptions) {
    super('value', 'mul_add', field);
  }
}
