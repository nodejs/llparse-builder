import * as assert from 'assert';
import { Node } from './base';

/**
 * This node consumes number of characters specified by state's property with
 * name `field` from the input, and forwards execution to `otherwise` node.
 */
export class Consume extends Node {
  /**
   * @param field  State's property name
   */
  constructor(public readonly field: string) {
    super('consume_' + field);

    if (/^_/.test(field)) {
      throw new Error(`Can't use internal field in \`consume()\`: "${field}"`);
    }
  }
}
