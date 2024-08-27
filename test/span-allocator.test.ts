import { beforeEach, describe, it, type TestContext } from 'node:test';
import { Builder, SpanAllocator } from '../src/builder';

describe('LLParse/LoopChecker', () => {
  let b: Builder;
  let sa: SpanAllocator;
  beforeEach(() => {
    b = new Builder();
    sa = new SpanAllocator();
  });

  it('should allocate single span', (t: TestContext) => {
    const span = b.span(b.code.span('span'));
    const start = b.node('start');
    const body = b.node('body');

    start
      .otherwise(span.start(body));

    body
      .skipTo(span.end(start));

    const res = sa.allocate(start);

    t.assert.strictEqual(res.max, 0);

    t.assert.strictEqual(res.concurrency.length, 1);
    t.assert.ok(res.concurrency[0].includes(span));

    t.assert.strictEqual(res.colors.size, 1);
    t.assert.strictEqual(res.colors.get(span), 0);
  });

  it('should allocate overlapping spans', (t: TestContext) => {
    const span1 = b.span(b.code.span('span1'));
    const span2 = b.span(b.code.span('span2'));

    const start = b.node('start');
    const body1 = b.node('body1');
    const body2 = b.node('body2');

    start
      .otherwise(span1.start(body1));

    body1
      .otherwise(span2.start(body2));

    body2
      .skipTo(span2.end(span1.end(start)));

    const res = sa.allocate(start);

    t.assert.strictEqual(res.max, 1);

    t.assert.strictEqual(res.concurrency.length, 2);
    t.assert.ok(res.concurrency[0].includes(span1));
    t.assert.ok(res.concurrency[1].includes(span2));

    t.assert.strictEqual(res.colors.size, 2);
    t.assert.strictEqual(res.colors.get(span1), 0);
    t.assert.strictEqual(res.colors.get(span2), 1);
  });

  it('should allocate non-overlapping spans', (t: TestContext) => {
    const span1 = b.span(b.code.span('span1'));
    const span2 = b.span(b.code.span('span2'));

    const start = b.node('start');
    const body1 = b.node('body1');
    const body2 = b.node('body2');

    start
      .match('a', span1.start(body1))
      .otherwise(span2.start(body2));

    body1
      .skipTo(span1.end(start));

    body2
      .skipTo(span2.end(start));

    const res = sa.allocate(start);

    t.assert.strictEqual(res.max, 0);

    t.assert.strictEqual(res.concurrency.length, 1);
    t.assert.ok(res.concurrency[0].includes(span1));
    t.assert.ok(res.concurrency[0].includes(span2));

    t.assert.strictEqual(res.colors.size, 2);
    t.assert.strictEqual(res.colors.get(span1), 0);
    t.assert.strictEqual(res.colors.get(span2), 0);
  });

  it('should throw on loops', (t: TestContext) => {
    const span = b.span(b.code.span('span_name'));

    const start = b.node('start');

    start
      .otherwise(span.start(start));

    t.assert.throws(() => {
      sa.allocate(start);
    }, /loop.*span_name/);
  });

  it('should throw on unmatched ends', (t) => {
    const start = b.node('start');
    const span = b.span(b.code.span('on_data'));

    start.otherwise(span.end().skipTo(start));

    t.assert.throws(() => sa.allocate(start), /unmatched.*on_data/i);
  });

  it('should throw on branched unmatched ends', (t: TestContext) => {
    const start = b.node('start');
    const end = b.node('end');
    const span = b.span(b.code.span('on_data'));

    start
      .match('a', end)
      .match('b', span.start(end))
      .otherwise(b.error(1, 'error'));

    end
      .otherwise(span.end(start));

    t.assert.throws(() => sa.allocate(start), /unmatched.*on_data/i);
  });

  it('should propagate through the Invoke map', (t) => {
    const start = b.node('start');
    const span = b.span(b.code.span('llparse__on_data'));

    b.property('i8', 'custom');

    start.otherwise(b.invoke(b.code.load('custom'), {
      0: span.end().skipTo(start),
    }, span.end().skipTo(start)));

    t.assert.doesNotThrow(() => sa.allocate(span.start(start)));
  });
});
