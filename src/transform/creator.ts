import { Transform } from './base';
import { ToLower } from './to-lower';
import { ToLowerUnsafe } from './to-lower-unsafe';

/**
 * API for creating character transformations.
 *
 * The results of methods of this class can be used as an argument to:
 * `p.node().transform(...)`.
 */
export class Creator {
  /**
   * Unsafe transform to lowercase.
   *
   * The operation of this transformation is equivalent to:
   * `String.fromCharCode(input.charCodeAt(0) | 0x20)`.
   */
  public toLowerUnsafe(): Transform {
    return new ToLowerUnsafe();
  }

  /**
   * Safe transform to lowercase.
   */
  public toLower(): Transform {
    return new ToLower();
  }
}
