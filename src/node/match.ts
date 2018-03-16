import * as assert from 'assert';
import { Buffer } from 'buffer';

import { Edge } from '../edge';
import { Transform } from '../transform';
import { toBuffer } from '../utils';
import { Node } from './base';

export type MatchSingleValue = string | number | Buffer;
export type MatchValue = MatchSingleValue | ReadonlyArray<MatchSingleValue>;
export interface IMatchSelect {
  readonly [key: string]: number;
}

export class Match extends Node {
  private transformFn: Transform | undefined;

  public transform(transformFn: Transform): this {
    this.transformFn = transformFn;
    return this;
  }

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

  public peek(value: MatchValue, next: Node): this {
    if (Array.isArray(value)) {
      for (const subvalue of value) {
        this.match(subvalue, next);
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

  public select(keyOrMap: MatchSingleValue | IMatchSelect,
                valueOrNext: number | Node, next?: Node): this {
    // .select({ key: value, ... }, next)
    if (typeof keyOrMap === 'object') {
      assert(valueOrNext instanceof Node,
        'Invalid `next` argument of `.select()`');
      assert.strictEqual(next, undefined,
        'Invalid argument count of `.select()`');

      const map: IMatchSelect = keyOrMap as IMatchSelect;
      next = valueOrNext as Node;

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

  public getTransform(): Transform | undefined {
    return this.transformFn;
  }
}
