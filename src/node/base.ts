import * as assert from 'assert';
import binarySearch = require('binary-search');
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
    return this.privEdges;
  }

  public *[Symbol.iterator](): Iterator<Edge> {
    yield* this.privEdges;
  }

  // Internal

  protected addEdge(edge: Edge): void {
    assert.notStrictEqual(edge.key, undefined);

    const index = binarySearch(this.privEdges, edge, Edge.compare);
    assert(index < 0, 'Attempting to create duplicate edge');

    this.privEdges.splice(-1 - index, 0, edge);
  }
}
