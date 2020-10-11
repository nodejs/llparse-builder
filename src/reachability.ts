import { Node } from './node';

/**
 * This class finds all reachable nodes
 */
export class Reachability {
  /**
   * Build and return list of reachable nodes.
   */
  public build(root: Node): ReadonlyArray<Node> {
    const res = new Set();
    const queue = [ root ];
    while (queue.length !== 0) {
      const node = queue.pop()!;
      if (res.has(node)) {
        continue;
      }
      res.add(node);

      for (const edge of node) {
        queue.push(edge.node);
      }

      const otherwise = node.getOtherwiseEdge();
      if (otherwise !== undefined) {
        queue.push(otherwise.node);
      }
    }
    return Array.from(res) as ReadonlyArray<Node>;
  }
}
