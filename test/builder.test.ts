import { beforeEach, describe, it, type TestContext } from 'node:test';
import { Builder } from '../src/builder';

describe('LLParse/Builder', () => {
  let b: Builder;
  beforeEach(() => {
    b = new Builder();
  });

  it('should build primitive graph', (t: TestContext) => {
    const start = b.node('start');
    const end = b.node('end');

    start
      .peek('e', end)
      .match('a', start)
      .otherwise(b.error(1, 'error'));

    end
      .skipTo(start);

    const edges = start.getEdges();
    t.assert.strictEqual(edges.length, 2);
    t.assert.ok(!edges[0].noAdvance);
    t.assert.strictEqual(edges[0].node, start);
    t.assert.ok(edges[1].noAdvance);
    t.assert.strictEqual(edges[1].node, end);
  });

  it('should disallow duplicate edges', (t: TestContext) => {
    const start = b.node('start');

    start.peek('e', start);

    t.assert.throws(() => {
      start.peek('e', start);
    }, /duplicate edge/);
  });

  it('should disallow select to non-invoke', (t: TestContext) => {
    const start = b.node('start');

    t.assert.throws(() => {
      start.select('a', 1, start);
    }, /value to non-Invoke/);
  });

  it('should disallow select to match-invoke', (t: TestContext) => {
    const start = b.node('start');
    const invoke = b.invoke(b.code.match('something'));

    t.assert.throws(() => {
      start.select('a', 1, invoke);
    }, /Invalid.*code signature/);
  });

  it('should disallow peek to value-invoke', (t: TestContext) => {
    const start = b.node('start');
    const invoke = b.invoke(b.code.value('something'));

    t.assert.throws(() => {
      start.peek('a', invoke);
    }, /Invalid.*code signature/);
  });

  it('should allow select to value-invoke', (t: TestContext) => {
    const start = b.node('start');
    const invoke = b.invoke(b.code.value('something'));

    t.assert.doesNotThrow(() => {
      start.select('a', 1, invoke);
    });
  });

  it('should create edges for Invoke', (t: TestContext) => {
    const start = b.node('start');
    const invoke = b.invoke(b.code.value('something'), {
      '-1': start,
      '1': start,
      '10': start,
    });

    const edges = invoke.getEdges();
    const keys = edges.map((edge) => edge.key!);
    t.assert.deepStrictEqual(keys, [
      -1,
      1,
      10,
    ]);
  });
});
