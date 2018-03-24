import * as assert from 'assert';
import binarySearch = require('binary-search');
import { Edge } from '../edge';

/**
 * Base class for all graph nodes.
 */
export abstract class Node {
  private otherwiseEdge: Edge | undefined;
  private privEdges: Edge[] = [];

  /**
   * @param name  Node name
   */
  constructor(public readonly name: string) {
    // no-op
  }

  /**
   * Create an otherwise edge to node `node`.
   *
   * This edge is executed when no other edges match current input. No
   * characters are consumed upon transition.
   *
   * NOTE: At most one otherwise (skipping or not) edge can be set, most nodes
   * except `Error` require it.
   *
   * @param node  Target node
   */
  public otherwise(node: Node): this {
    if (this.otherwiseEdge !== undefined) {
      throw new Error('Node already has `otherwise` or `skipTo`');
    }

    this.otherwiseEdge = new Edge(node, true, undefined, undefined);
    return this;
  }

  /**
   * Create a skipping otherwise edge to node `node`.
   *
   * This edge is executed when no other edges match current input. Single
   * character is consumed upon transition.
   *
   * NOTE: At most one otherwise (skipping or not) edge can be set, most nodes
   * except `Error` require it.
   *
   * @param node  Target node
   */
  public skipTo(node: Node): this {
    if (this.otherwiseEdge !== undefined) {
      throw new Error('Node already has `otherwise` or `skipTo`');
    }

    this.otherwiseEdge = new Edge(node, false, undefined, undefined);
    return this;
  }

  // Limited public use

  /** Get otherwise edge. */
  public getOtherwiseEdge(): Edge | undefined {
    return this.otherwiseEdge;
  }

  /** Get list of all non-otherwise edges. */
  public getEdges(): ReadonlyArray<Edge> {
    return this.privEdges;
  }

  /** Get list of all edges (including otherwise, if present). */
  public getAllEdges(): ReadonlyArray<Edge> {
    const res = this.privEdges;
    if (this.otherwiseEdge === undefined) {
      return res;
    } else {
      return res.concat(this.otherwiseEdge);
    }
  }

  /** Get iterator through all non-otherwise edges. */
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
