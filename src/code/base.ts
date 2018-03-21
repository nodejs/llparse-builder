export type Signature = 'match' | 'value';

/**
 * Base code class.
 */
export abstract class Code {
  /**
   * @param signature  Code signature to be used. `match` means that code takes
   *                   no input value (from `.select()`), otherwise it must be
   *                   `value`
   * @param name       External function or intrinsic name.
   */
  constructor(public readonly signature: Signature,
              public readonly name: string) {
  }
}
