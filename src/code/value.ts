import { Code } from './base';

export class Value extends Code {
  constructor(name: string) {
    super('value', name);
  }
}
