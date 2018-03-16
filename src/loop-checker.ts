import * as assert from 'assert';
import { Buffer } from 'buffer';

import { Node } from './node';

type ReachableSet = Set<Node>;

interface IQueueItem {
  readonly key: Buffer | undefined;
  readonly node: Node;
}

export class LoopChecker {
  private reachableMap: Map<Node, ReachableSet> = new Map();

  public check(root: Node): void {
    const queue: IQueueItem[] = [{ key: undefined, node: root }];

    while (queue.length !== 0) {
      const item: IQueueItem = queue.pop()!;
      const lastKey: Buffer | undefined = item.key;
      const node = item.node;

      let edges = Array.from(node);
      const otherwiseEdge = node.getOtherwiseEdge();
      if (otherwiseEdge !== undefined) {
        edges.push(otherwiseEdge);
      }

      // Loops like:
      //
      // `nodeA: peek(A)` => `nodeB: match(A), otherwise -> nodeA`
      //
      // should pass the check
      if (lastKey !== undefined) {
        // Remove all unreachable clauses
        edges = edges.filter((edge) => {
          return edge.key === undefined ||
                 typeof edge.key === 'number' ||
                 edge.key.compare(lastKey) === 0;
        });

        // See if there is a matching peek clause
        const sameKey = edges.some((edge) => {
          return !edge.noAdvance &&
                 Buffer.isBuffer(edge.key) &&
                 edge.key.compare(lastKey) === 0;
        });
        if (sameKey) {
          continue;
        }
      }

      // We're interested in only those edges that can create loops
      edges = edges.filter((edge) => edge.noAdvance);

      edges.forEach((edge) => {
        if (!this.addEdge(node, edge.node)) {
          return;
        }

        let nextKey: Buffer | undefined;

        // Number edge keys are present in Invoke, otherwise they are buffers
        if (typeof edge.key === 'number' || edge.key === undefined) {
          nextKey = lastKey;
        } else if (edge.key.length === 1) {
          nextKey = edge.key;
        } else {
          nextKey = lastKey;
        }

        queue.push({
          key: nextKey,
          node: edge.node,
        });
      });
    }
  }

  private reachable(from: Node): ReachableSet {
    if (this.reachableMap.has(from)) {
      return this.reachableMap.get(from)!;
    }

    const res: ReachableSet = new Set([ from ]);
    this.reachableMap.set(from, res);
    return res;
  }

  private addEdge(from: Node, to: Node): boolean {
    const target: ReachableSet = this.reachable(to);

    let changed = false;
    this.reachable(from).forEach((node) => {
      if (to === node) {
        throw new Error(`Loop detected in "${to.name}", ` +
          `through the backedge from "${from.name}"`);
      }

      if (target.has(node)) {
        return;
      }

      changed = true;
      target.add(node);
    });

    return changed;
  }
}
