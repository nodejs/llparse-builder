import * as assert from 'assert';

import { Builder } from '../src/builder';

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

  it('should disallow duplicate edges', () => {
    const start = b.node('start');

    start.peek('e', start);

    assert.throws(() => {
      start.peek('e', start);
    }, /duplicate edge/);
  });

  it('should disallow select to non-invoke', () => {
    const start = b.node('start');

    assert.throws(() => {
      start.select('a', 1, start);
    }, /value to non-Invoke/);
  });

  it('should disallow select to match-invoke', () => {
    const start = b.node('start');
    const invoke = b.invoke(b.code.match('something'));

    assert.throws(() => {
      start.select('a', 1, invoke);
    }, /Invalid.*code signature/);
  });

  it('should disallow peek to value-invoke', () => {
    const start = b.node('start');
    const invoke = b.invoke(b.code.value('something'));

    assert.throws(() => {
      start.peek('a', invoke);
    }, /Invalid.*code signature/);
  });

  it('should allow select to value-invoke', () => {
    const start = b.node('start');
    const invoke = b.invoke(b.code.value('something'));

    assert.doesNotThrow(() => {
      start.select('a', 1, invoke);
    });
  });

  it('should create edges for Invoke', () => {
    const start = b.node('start');
    const invoke = b.invoke(b.code.value('something'), {
      '-1': start,
      '1': start,
      '10': start,
    });

    const edges = invoke.getEdges();
    const keys = edges.map((edge) => edge.key!);
    assert.deepStrictEqual(keys, [
      -1,
      1,
      10,
    ]);
  });
});
