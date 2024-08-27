import * as assert from 'node:assert';
import { debuglog } from 'node:util';

import { Node, SpanEnd, SpanStart } from './node';
import { Reachability } from './reachability';
import { Span } from './span';

const debug = debuglog('llparse-builder:span-allocator');

type SpanSet = Set<Span>;

interface ISpanActiveInfo {
  readonly active: Map<Node, SpanSet>;
  readonly spans: readonly Span[];
}

type SpanOverlap = Map<Span, SpanSet>;

export interface ISpanAllocatorResult {
  readonly colors: ReadonlyMap<Span, number>;
  readonly concurrency: readonly (readonly Span[])[];
  readonly max: number;
}

function id(node: SpanStart | SpanEnd): Span {
  return node.span;
}

export class SpanAllocator {
  public allocate(root: Node): ISpanAllocatorResult {
    const r = new Reachability();
    const nodes = r.build(root);
    const info = this.computeActive(nodes);
    this.check(info);
    const overlap = this.computeOverlap(info);
    return this.color(info.spans, overlap);
  }

  private computeActive(nodes: readonly Node[]): ISpanActiveInfo {
    const activeMap = new Map<Node, SpanSet>();
    nodes.forEach((node) => activeMap.set(node, new Set()));

    const queue = new Set<Node>(nodes);
    const spans: SpanSet = new Set();
    for (const node of queue) {
      queue.delete(node);

      const active = activeMap.get(node)!;

      if (node instanceof SpanStart) {
        const span = id(node);
        spans.add(span);
        active.add(span);
      }

      active.forEach((span) => {
        // Don't propagate span past the spanEnd
        if (node instanceof SpanEnd && span === id(node)) {
          return;
        }

        node.getAllEdges().forEach((edge) => {
          const edgeNode = edge.node;

          // Disallow loops
          if (edgeNode instanceof SpanStart) {
            assert.notStrictEqual(id(edgeNode), span,
              `Detected loop in span "${span.callback.name}", started ` +
              `at "${node.name}"`);
          }

          const edgeActive = activeMap.get(edgeNode)!;
          if (edgeActive.has(span)) {
            return;
          }

          edgeActive.add(span);
          queue.add(edgeNode);
        });
      });
    }

    return { active: activeMap, spans: Array.from(spans) };
  }

  private check(info: ISpanActiveInfo): void {
    debug('check start');
    for (const [ node, spans ] of info.active) {
      for (const edge of node.getAllEdges()) {
        if (edge.node instanceof SpanStart) {
          continue;
        }

        // Skip terminal nodes
        if (edge.node.getAllEdges().length === 0) {
          continue;
        }

        debug('checking edge from %j to %j', node.name, edge.node.name);

        const edgeSpans = info.active.get(edge.node)!;
        for (const subSpan of edgeSpans) {
          assert(spans.has(subSpan),
            `Unmatched span end for "${subSpan.callback.name}" ` +
            `at "${edge.node.name}", coming from "${node.name}"`);
        }

        if (edge.node instanceof SpanEnd) {
          const span = id(edge.node);
          assert(spans.has(span),
            `Unmatched span end for "${span.callback.name}"`);
        }
      }
    }
  }

  private computeOverlap(info: ISpanActiveInfo): SpanOverlap {
    const active = info.active;
    const overlap: SpanOverlap = new Map();

    info.spans.forEach((span) => overlap.set(span, new Set()));

    active.forEach((spans) => {
      spans.forEach((one) => {
        const set = overlap.get(one)!;
        spans.forEach((other) => {
          if (other !== one) {
            set.add(other);
          }
        });
      });
    });

    return overlap;
  }

  private color(spans: readonly Span[], overlapMap: SpanOverlap)
    : ISpanAllocatorResult {
    let max = -1;
    const colors = new Map<Span, number>();

    const allocate = (span: Span): number => {
      if (colors.has(span)) {
        return colors.get(span)!;
      }

      const overlap = overlapMap.get(span)!;

      // See which colors are already used
      const used = new Set<number>();
      for (const subSpan of overlap) {
        if (colors.has(subSpan)) {
          used.add(colors.get(subSpan)!);
        }
      }

      // Find minimum available color
      let i;
      for (i = 0; used.has(i); i++) {
        // no-op
      }

      max = Math.max(max, i);
      colors.set(span, i);

      return i;
    };

    const map = new Map<Span, number>();

    spans.forEach((span) => map.set(span, allocate(span)));

    const concurrency: Span[][] = new Array(max + 1);
    for (let i = 0; i < concurrency.length; i++) {
      concurrency[i] = [];
    }

    spans.forEach((span) => concurrency[allocate(span)].push(span));

    return { colors: map, concurrency, max };
  }
}
