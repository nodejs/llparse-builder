export type TransformName = 'to_lower_unsafe' | 'to_lower';

/**
 * Character transformation.
 */
export abstract class Transform {
  /**
   * @param name  Transform name
   */
  constructor(public readonly name: TransformName) {
  }
}
