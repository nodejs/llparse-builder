import * as assert from 'assert';

import { Builder, LoopChecker } from '../src/builder';

describe('LLParse/LoopChecker', () => {
  let b: Builder;
  let lc: LoopChecker;
  beforeEach(() => {
    b = new Builder();
    lc = new LoopChecker();
  });

  it('should detect shallow loops', () => {
    const start = b.node('start');

    start
      .otherwise(start);

    assert.throws(() => {
      lc.check(start);
    }, /Detected loop in "start".*"start"/);
  });

  it('should detect loops', () => {
    const start = b.node('start');
    const a = b.node('a');
    const invoke = b.invoke(b.code.match('nop'), {
      0: start,
    }, b.error(1, 'error'));

    start
      .peek('a', a)
      .otherwise(b.error(1, 'error'));

    a.otherwise(invoke);

    assert.throws(() => {
      lc.check(start);
    }, /Detected loop in "a".*"a" -> "invoke_nop"/);
  });

  it('should detect seemingly unreachable keys', () => {
    const start = b.node('start');
    const loop = b.node('loop');

    start
      .peek('a', loop)
      .otherwise(b.error(1, 'error'));

    loop
      .match('a', loop)
      .otherwise(loop);

    assert.throws(() => {
      lc.check(start);
    }, /Detected loop in "loop" through.*"loop"/);
  });

  it('should ignore loops through `peek` to `match`', () => {
    const start = b.node('start');
    const a = b.node('a');
    const invoke = b.invoke(b.code.match('nop'), {
      0: start,
    }, b.error(1, 'error'));

    start
      .peek('a', a)
      .otherwise(b.error(1, 'error'));

    a
      .match('abc', invoke)
      .otherwise(start);

    assert.doesNotThrow(() => lc.check(start));
  });

  it('should ignore irrelevant `peek`s', () => {
    const start = b.node('start');
    const a = b.node('a');

    start
      .peek('a', a)
      .otherwise(b.error(1, 'error'));

    a
      .peek('b', start)
      .otherwise(b.error(1, 'error'));

    assert.doesNotThrow(() => lc.check(start));
  });
});
