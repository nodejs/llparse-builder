import { Buffer } from 'buffer';
import { Node } from './node';

export class Edge {
  public static compare(a: Edge, b: Edge): number {
    return a.key!.compare(b.key!);
  }

  constructor(public readonly node: Node,
              public readonly noAdvance: boolean,
              public readonly key: Buffer | undefined,
              public readonly value: number | undefined) {
  }
}
