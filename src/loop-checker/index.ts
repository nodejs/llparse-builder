import * as assert from 'assert';
import * as debugAPI from 'debug';

import { Node } from '../node';
import { Reachability } from '../reachability';
import { Lattice } from './lattice';

const debug = debugAPI('llparse-builder:loop-checker');

const EMPTY_VALUE = new Lattice('empty');
const ANY_VALUE = new Lattice('any');

/**
 * This class implements a loop checker pass. The goal of this pass is to verify
 * that the graph doesn't contain infinite loops.
 */
export class LoopChecker {
  private readonly lattice: Map<Node, Lattice> = new Map();

  // Just a cache of terminated keys
  private readonly terminatedCache: Map<Node, Lattice> = new Map();

  /**
   * Run loop checker pass on a graph starting from `root`.
   *
   * Throws on failure.
   *
   * @param root  Graph root node
   */
  public check(root: Node): void {
    const r = new Reachability();

    const nodes = r.build(root);

    // Set initial lattice value for all nodes
    for (const node of nodes) {
      this.lattice.set(node, EMPTY_VALUE);
    }

    // Mark root as reachable with any value
    this.lattice.set(root, ANY_VALUE);

    // Raise lattice values
    let changed: Set<Node> = new Set([ root ]);
    while (changed.size !== 0) {
      if (debug.enabled) {
        debug('changed %j', Array.from(changed).map((node) => node.name));
      }

      const next: Set<Node> = new Set();
      for (const node of changed) {
        this.propagate(node, next);
      }
      changed = next;
    }

    debug('lattice stabilized');

    // Visit nodes and walk through reachable edges to detect loops
    // TODO(indutny): optimize if needed
    for (const node of nodes) {
      debug('check node %j', node.name);
      this.visit(node, []);
    }
  }

  private propagate(node: Node, changed: Set<Node>): void {
    let value: Lattice = this.lattice.get(node)!;
    debug('propagate(%j), initial value %j', node.name, value);

    // Terminate values that are consumed by `match`/`select`
    const terminated = this.terminate(node, value, changed);
    if (!terminated.isEqual(EMPTY_VALUE)) {
      debug('node %j terminates %j', node.name, terminated);
      value = value.subtract(terminated);
      if (value.isEqual(EMPTY_VALUE)) {
        return;
      }
    }

    // Propagate value through `.peek()`/`.otherwise()` edges
    // TODO(indutny): optimize if needed
    for (const edge of node.getAllEdges()) {
      if (!edge.noAdvance) {
        continue;
      }

      let targetValue = this.lattice.get(edge.node)!;

      // `otherwise` or `Invoke`'s edges
      if (edge.key === undefined || typeof edge.key === 'number') {
        targetValue = targetValue.union(value);
        debug('node %j propagates %j to %j', node.name, targetValue,
          edge.node.name);
      } else {
        // `.peek()`
        const edgeValue = new Lattice([ edge.key[0] ]).intersect(value);
        if (edgeValue.isEqual(EMPTY_VALUE)) {
          continue;
        }

        targetValue = targetValue.union(edgeValue);
        debug('node %j propagates %j to %j through peek', node.name,
          targetValue, edge.node.name);
      }
      this.update(edge.node, targetValue, changed);
    }
  }

  private update(node: Node, newValue: Lattice, changed: Set<Node>): boolean {
    const value = this.lattice.get(node)!;
    if (newValue.isEqual(value)) {
      return false;
    }

    this.lattice.set(node, newValue);
    changed.add(node);
    return true;
  }

  private terminate(node: Node, value: Lattice, changed: Set<Node>): Lattice {
    if (this.terminatedCache.has(node)) {
      return this.terminatedCache.get(node)!;
    }

    const terminated: number[] = [];
    for (const edge of node.getAllEdges()) {
      if (edge.noAdvance) {
        continue;
      }

      // Ignore `otherwise` and `Invoke`'s edges
      if (edge.key === undefined || typeof edge.key === 'number') {
        continue;
      }

      terminated.push(edge.key[0]);
      debug('node %j propagates %j to %j', node.name, ANY_VALUE,
        edge.node.name);

      // Propagate `any` to those nodes since they can get any character
      this.update(edge.node, ANY_VALUE, changed);

    }

    const result = new Lattice(terminated);
    this.terminatedCache.set(node, result);
    return result;
  }

  private visit(node: Node, path: ReadonlyArray<Node>): void {
    let value = this.lattice.get(node)!;
    debug('enter %j, value is %j', node.name, value);

    const terminated = this.terminatedCache.has(node) ?
      this.terminatedCache.get(node)! : EMPTY_VALUE;
    if (!terminated.isEqual(EMPTY_VALUE)) {
      debug('subtract terminated %j', terminated);
      value = value.subtract(terminated);
      if (value.isEqual(EMPTY_VALUE)) {
        debug('terminated everything');
        return;
      }
    }

    for (const edge of node.getAllEdges()) {
      if (!edge.noAdvance) {
        continue;
      }

      let edgeValue = value;

      // `otherwise` or `Invoke`'s edges
      if (edge.key === undefined || typeof edge.key === 'number') {
        // nothing to do
      // `.peek()`
      } else {
        edgeValue = edgeValue.intersect(new Lattice([ edge.key[0] ]));
      }

      // Ignore unreachable edges
      if (edgeValue.isEqual(EMPTY_VALUE)) {
        continue;
      }
      if (path.indexOf(edge.node) !== -1) {
        if (path.length === 0) {
          throw new Error(
            `Detected loop in "${edge.node.name}" through "${edge.node.name}"`);
        }
        throw new Error(
          `Detected loop in "${edge.node.name}" through chain ` +
            `${path.map((parent) => '"' + parent.name + '"').join(' -> ')}`);
      }
      this.visit(edge.node, path.concat(edge.node));
    }

    debug('leave %j', node.name);
  }
}
