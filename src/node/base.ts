import * as assert from 'assert';
import { Edge } from '../edge';

export abstract class Node {
  private otherwiseEdge: Edge | undefined;
  private privEdges: Edge[] = [];

  constructor(public readonly name: string) {
    // no-op
  }

  public otherwise(node: Node): this {
    if (this.otherwiseEdge !== undefined) {
      throw new Error('Node already has `otherwise` or `skipTo`');
    }

    this.otherwiseEdge = new Edge(node, false, undefined, undefined);
    return this;
  }

  public skipTo(node: Node): this {
    if (this.otherwiseEdge !== undefined) {
      throw new Error('Node already has `otherwise` or `skipTo`');
    }

    this.otherwiseEdge = new Edge(node, true, undefined, undefined);
    return this;
  }

  // Limited public use

  public getOtherwiseEdge(): Edge | undefined {
    return this.otherwiseEdge;
  }

  public getEdges(): ReadonlyArray<Edge> {
    // TODO(indutny): binary insert below?
    return this.privEdges.sort((a, b) => {
      return a.key!.compare(b.key!);
    });
  }

  // Internal

  protected addEdge(edge: Edge): void {
    assert.notStrictEqual(edge.key, undefined);

    const isDup = this.privEdges.some((other) => {
      return other.key!.compare(edge.key!) === 0;
    });
    if (isDup) {
      throw new Error('Attempting to create duplicate edge');
    }
    this.privEdges.push(edge);
  }
}
