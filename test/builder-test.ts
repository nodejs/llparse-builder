import * as assert from 'assert';

import { Builder } from '../';

describe('LLParse/Builder', () => {
  let b: Builder;
  beforeEach(() => {
    b = new Builder();
  });

  it('should build primitive graph', () => {
    const start = b.node('start');
    const end = b.node('end');

    start
      .peek('e', end)
      .match('a', start)
      .otherwise(b.error(1, 'error'));

    end
      .skipTo(start);

    const edges = start.getEdges();
    assert.strictEqual(edges.length, 2);

    assert(!edges[0].noAdvance);
    assert.strictEqual(edges[0].node, start);

    assert(edges[1].noAdvance);
    assert.strictEqual(edges[1].node, end);
  });
});
