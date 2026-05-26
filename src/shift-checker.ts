import { debuglog } from 'node:util';

import { Property } from './property';
import { Node, Shift } from './node';
import { Reachability } from './reachability';


const debug = debuglog('llparse-builder:shift-checker');

/**
 * Validates shift nodes to find invalid or missing properties or bit sizes
 */
export class ShiftChecker {
  public readonly property_table = new Map<string, Property>();
  constructor (properties: readonly Property[]){
    properties.forEach((prop) => {this.property_table.set(prop.name, prop)});
  }

  /**
     * validates a single shift node to see if a property exists
     * to be fed bits to. It also has the ability of checking if numbers
     * may overflow.
     * 
     * @param shift the shift node to check.
     */
  private validate_shift(shift: Shift): void{
    const property = this.property_table.get(shift.field);
    if (!property){
      throw new Error(`"${shift.field}" has not been defined for ${shift.name}`);
    }
    let size;
    switch (property.ty){
      case 'ptr':
        throw new Error(
          `${shift.field} cannot be provided to "${shift.name}" because field was defined as a "ptr"`
        );
      case 'i8':
        size = 1;
        break;
      case 'i16':
        size = 2;
        break;
      case 'i32':
        size = 4;
        break;
      case 'i64':
        size = 8;
        break;
      default:
        /* TODO (Vizonex): ensure this is unreachable. */
        /* UNREACHABLE */
        size = 0;
    }
    // Ensure bits can't overflow...
    if (shift.bits > size){
      throw new Error(`${shift.bits} > ${size} and will cause node "${shift.field}" to overflow.`)
    }
  }

  /** 
     * Run shift checker pass on a graph starting from `root`. 
     * 
     * @param root Graph root node
     */
  public check(root: Node): void {
    const r = new Reachability();
    const nodes = r.build(root);
        
    for (const node of nodes){
      if (node instanceof Shift){
        debug('checking %j', node.name);
        this.validate_shift(node);
      }
    }
  }
}

