import { Buffer } from 'buffer';
import { Node } from './node';

export class Edge {
  constructor(public readonly node: Node,
              public readonly noAdvance: boolean,
              public readonly key: Buffer | undefined,
              public readonly value: number | undefined) {
  }
}
