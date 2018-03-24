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

    for (const node of nodes) {
      debug('checking loops starting from %j', node.name);

      // Set initial lattice value for all nodes
      this.clear(nodes);

      // Mark root as reachable with any value
      this.lattice.set(node, ANY_VALUE);

      // Raise lattice values
      let changed: Set<Node> = new Set([ root ]);
      while (changed.size !== 0) {
        if (debug.enabled) {
          debug('changed %j', Array.from(changed).map((other) => other.name));
        }

        const next: Set<Node> = new Set();
        for (const changedNode of changed) {
          this.propagate(changedNode, next);
        }
        changed = next;
      }

      debug('lattice stabilized');

      // Visit nodes and walk through reachable edges to detect loops
      this.visit(node, []);
    }
  }

  private clear(nodes: ReadonlyArray<Node>): void {
    for (const node of nodes) {
      this.lattice.set(node, EMPTY_VALUE);
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

    const keysByTarget: Map<Node, Lattice> = new Map();
    // Propagate value through `.peek()`/`.otherwise()` edges
    for (const edge of node.getAllEdges()) {
      if (!edge.noAdvance) {
        continue;
      }

      let targetValue: Lattice;
      if (keysByTarget.has(edge.node)) {
        targetValue = keysByTarget.get(edge.node)!;
      } else {
        targetValue = this.lattice.get(edge.node)!;
      }

      // `otherwise` or `Invoke`'s edges
      if (edge.key === undefined || typeof edge.key === 'number') {
        targetValue = targetValue.union(value);
      } else {
        // `.peek()`
        const edgeValue = new Lattice([ edge.key[0] ]).intersect(value);
        if (edgeValue.isEqual(EMPTY_VALUE)) {
          continue;
        }

        targetValue = targetValue.union(edgeValue);
      }

      keysByTarget.set(edge.node, targetValue);
    }

    for (const [ child, childValue ] of keysByTarget) {
      debug('node %j propagates %j to %j', node.name, childValue,
        child.name);
      this.update(child, childValue, changed);
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
