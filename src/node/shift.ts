import { Node } from './base';

/**
 * This node consumes and stores an integer into a specified
 * `field` from the input before forwarding execution.
 */
export class Shift extends Node { 
  /**
     * @param field State's property name
     * @param bits number of bits to shift it can be between 1 and 8
     * @param lshift if true, bits are shifted to the left. 
     * otherwise, it goes in the opposite direction.
     */
  constructor (public readonly field: string, public readonly bits:number, public readonly lshift: boolean){
    const name = (lshift) ? "lshift" : "rshift";
    const operation = (bits > 1) ? `_${bits * 8}`: "";
    super(`${name}_${field}${operation}`);
    if (/^_/.test(field)) {
      throw new Error(`Can't use internal field in \`.${name}()\`: "${field}"`);
    }
    if (bits < 1 || bits > 8){
      throw new Error(`bits must be a number between 1 to 8`);
    }
  }
  /** `.otherwise()` is not supported on this type of node as it consumes a bit.
     * enabling this defeats the purpose.
     */
  public otherwise(): this { throw new Error('Not supported'); }
}