import * as assert from 'assert';
import { Buffer } from 'buffer';

import { Edge } from '../edge';
import { Transform } from '../transform';
import { toBuffer } from '../utils';
import { Node } from './base';

/**
 * Character/sequence to match.
 *
 * May have following types:
 *
 * * `number` - for single character
 * * `string` - for printable character sequence
 * * `Buffer` - for raw byte sequence
 */
export type MatchSingleValue = string | number | Buffer;

/**
 * Convenience type for passing several characters/sequences to match methods.
 */
export type MatchValue = MatchSingleValue | ReadonlyArray<MatchSingleValue>;

/**
 * A map from characters/sequences to `.select()`'s values. Used for specifying
 * the value to be passed to `.select()'`s targets.
 */
export interface IMatchSelect {
  readonly [key: string]: number;
}

/**
 * This node matches characters/sequences and forwards the execution according
 * to matched character with optional attached value (See `.select()`).
 */
export class Match extends Node {
  private transformFn: Transform | undefined;

  /**
   * Set character transformation function.
   *
   * @param transform  Transformation to apply. Can be created with
   *                   `builder.transform.*()` methods.
   */
  public transform(transformFn: Transform): this {
    this.transformFn = transformFn;
    return this;
  }

  /**
   * Match sequence/character and forward execution to `next` on success,
   * consuming matched bytes of the input.
   *
   * No value is attached on such execution forwarding, and the target node
   * **must not** be an `Invoke` node with a callback expecting the value.
   *
   * @param value  Sequence/character to be matched
   * @param next   Target node to be executed on success.
   */
  public match(value: MatchValue, next: Node): this {
    if (Array.isArray(value)) {
      for (const subvalue of value) {
        this.match(subvalue, next);
      }
      return this;
    }

    const buffer = toBuffer(value as MatchSingleValue);
    const edge = new Edge(next, false, buffer, undefined);
    this.addEdge(edge);
    return this;
  }

  /**
   * Match character and forward execution to `next` on success
   * without consuming one byte of the input.
   *
   * No value is attached on such execution forwarding, and the target node
   * **must not** be an `Invoke` with a callback expecting the value.
   *
   * @param value  Character to be matched
   * @param next   Target node to be executed on success.
   */
  public peek(value: MatchValue, next: Node): this {
    if (Array.isArray(value)) {
      for (const subvalue of value) {
        this.peek(subvalue, next);
      }
      return this;
    }

    const buffer = toBuffer(value as MatchSingleValue);
    assert.strictEqual(buffer.length, 1,
      '`.peek()` accepts only single character keys');

    const edge = new Edge(next, true, buffer, undefined);
    this.addEdge(edge);
    return this;
  }

  /**
   * Match character/sequence and forward execution to `next` on success
   * consumed matched bytes of the input.
   *
   * Value is attached on such execution forwarding, and the target node
   * **must** be an `Invoke` with a callback expecting the value.
   *
   * Possible signatures:
   *
   * * `.select(key, value [, next ])`
   * * `.select({ key: value } [, next])`
   *
   * @param keyOrMap     Either a sequence to match, or a map from sequences to
   *                     values
   * @param valueOrNext  Either an integer value to be forwarded to the target
   *                     node, or an otherwise node
   * @param next         Convenience param. Same as calling `.otherwise(...)`
   */
  public select(keyOrMap: MatchSingleValue | IMatchSelect,
                valueOrNext?: number | Node, next?: Node): this {
    // .select({ key: value, ... }, next)
    if (typeof keyOrMap === 'object') {
      assert(valueOrNext instanceof Node,
        'Invalid `next` argument of `.select()`');
      assert.strictEqual(next, undefined,
        'Invalid argument count of `.select()`');

      const map: IMatchSelect = keyOrMap as IMatchSelect;
      next = valueOrNext as Node | undefined;

      Object.keys(map).forEach((mapKey) => {
        const numKey: number = mapKey as any;

        this.select(numKey, map[numKey]!, next);
      });
      return this;
    }

    // .select(key, value, next)
    assert.strictEqual(typeof valueOrNext, 'number',
      'Invalid `value` argument of `.select()`');
    assert.notStrictEqual(next, undefined,
      'Invalid `next` argument of `.select()`');

    const key = toBuffer(keyOrMap as MatchSingleValue);
    const value = valueOrNext as number;

    const edge = new Edge(next!, false, key, value);
    this.addEdge(edge);
    return this;
  }

  // Limited public use

  /**
   * Get tranformation function
   */
  public getTransform(): Transform | undefined {
    return this.transformFn;
  }
}
