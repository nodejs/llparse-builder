import * as assert from 'assert';

import { Builder, SpanAllocator } from '../src/builder';

describe('LLParse/LoopChecker', () => {
  let b: Builder;
  let sa: SpanAllocator;
  beforeEach(() => {
    b = new Builder();
    sa = new SpanAllocator();
  });

  it('should allocate single span', () => {
    const span = b.span(b.code.span('span'));
    const start = b.node('start');
    const body = b.node('body');

    start
      .otherwise(span.start(body));

    body
      .skipTo(span.end(start));

    const res = sa.allocate(start);

    assert.strictEqual(res.max, 0);

    assert.strictEqual(res.concurrency.length, 1);
    assert.ok(res.concurrency[0].includes(span));

    assert.strictEqual(res.colors.size, 1);
    assert.strictEqual(res.colors.get(span), 0);
  });

  it('should allocate overlapping spans', () => {
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

    assert.strictEqual(res.max, 1);

    assert.strictEqual(res.concurrency.length, 2);
    assert.ok(res.concurrency[0].includes(span1));
    assert.ok(res.concurrency[1].includes(span2));

    assert.strictEqual(res.colors.size, 2);
    assert.strictEqual(res.colors.get(span1), 0);
    assert.strictEqual(res.colors.get(span2), 1);
  });

  it('should allocate non-overlapping spans', () => {
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

    assert.strictEqual(res.max, 0);

    assert.strictEqual(res.concurrency.length, 1);
    assert.ok(res.concurrency[0].includes(span1));
    assert.ok(res.concurrency[0].includes(span2));

    assert.strictEqual(res.colors.size, 2);
    assert.strictEqual(res.colors.get(span1), 0);
    assert.strictEqual(res.colors.get(span2), 0);
  });

  it('should throw on loops', () => {
    const span = b.span(b.code.span('span_name'));

    const start = b.node('start');

    start
      .otherwise(span.start(start));

    assert.throws(() => {
      sa.allocate(start);
    }, /loop.*span_name/);
  });

  it('should throw on unmatched ends', () => {
    const start = b.node('start');
    const span = b.span(b.code.span('on_data'));

    start.otherwise(span.end().skipTo(start));

    assert.throws(() => sa.allocate(start), /unmatched.*on_data/i);
  });

  it('should throw on branched unmatched ends', () => {
    const start = b.node('start');
    const end = b.node('end');
    const span = b.span(b.code.span('on_data'));

    start
      .match('a', end)
      .match('b', span.start(end))
      .otherwise(b.error(1, 'error'));

    end
      .otherwise(span.end(start));

    assert.throws(() => sa.allocate(start), /unmatched.*on_data/i);
  });

  it('should propagate through the Invoke map', () => {
    const start = b.node('start');
    const span = b.span(b.code.span('llparse__on_data'));

    b.property('i8', 'custom');

    start.otherwise(b.invoke(b.code.load('custom'), {
      0: span.end().skipTo(start),
    }, span.end().skipTo(start)));

    assert.doesNotThrow(() => sa.allocate(span.start(start)));
  });
});
