import { beforeEach, describe, it, type TestContext } from 'node:test';
import { Builder, LoopChecker } from '../src/builder';

describe('LLParse/LoopChecker', () => {
  let b: Builder;
  let lc: LoopChecker;
  beforeEach(() => {
    b = new Builder();
    lc = new LoopChecker();
  });

  it('should detect shallow loops', (t: TestContext) => {
    const start = b.node('start');

    start
      .otherwise(start);

    t.assert.throws(() => {
      lc.check(start);
    }, /Detected loop in "start".*"start"/);
  });

  it('should detect loops', (t: TestContext) => {
    const start = b.node('start');
    const a = b.node('a');
    const invoke = b.invoke(b.code.match('nop'), {
      0: start,
    }, b.error(1, 'error'));

    start
      .peek('a', a)
      .otherwise(b.error(1, 'error'));

    a.otherwise(invoke);

    t.assert.throws(() => {
      lc.check(start);
    }, /Detected loop in "a".*"a" -> "invoke_nop"/);
  });

  it('should detect seemingly unreachable keys', (t: TestContext) => {
    const start = b.node('start');
    const loop = b.node('loop');

    start
      .peek('a', loop)
      .otherwise(b.error(1, 'error'));

    loop
      .match('a', loop)
      .otherwise(loop);

    t.assert.throws(() => {
      lc.check(start);
    }, /Detected loop in "loop" through.*"loop"/);
  });

  it('should ignore loops through `peek` to `match`', (t: TestContext) => {
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

    t.assert.doesNotThrow(() => lc.check(start));
  });

  it('should ignore irrelevant `peek`s', (t: TestContext) => {
    const start = b.node('start');
    const a = b.node('a');

    start
      .peek('a', a)
      .otherwise(b.error(1, 'error'));

    a
      .peek('b', start)
      .otherwise(b.error(1, 'error'));

    t.assert.doesNotThrow(() => lc.check(start));
  });

  it('should ignore loops with multi `peek`/`match`', (t: TestContext) => {
    const start = b.node('start');
    const another = b.node('another');

    const NUM: readonly string[] = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    ];

    const ALPHA: readonly string[] = [
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
      'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
      'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    ];

    start
      .match(ALPHA, start)
      .peek(NUM, another)
      .skipTo(start);

    another
      .match(NUM, another)
      .otherwise(start);

    t.assert.doesNotThrow(() => lc.check(start));
  });
});
