import { beforeEach, describe, it, TestContext } from 'node:test';
import { Builder, ShiftChecker } from '../src/builder';

describe ('LLParse/ShiftChecker', () => {
  let b: Builder;
  let sc: ShiftChecker;

  beforeEach(() => {
    b = new Builder();
  });

  it('should prohibit undefined properties', (t: TestContext) => {
    const lshift = b.lshift("undefined", 1);
    const start = b.node('start');
        
    start
      .otherwise(lshift);
    lshift.skipTo(start);
    sc = new ShiftChecker(b.properties);

    t.assert.throws(() => {   
      sc.check(start);
    }, /has not been defined for.*undefined/)
  });

  it('should detect overflowing bits', (t: TestContext) => {
    const rshift = b.rshift("defined", 8);
    const start = b.node('start');
        
    b.property('i8', "defined");
        
    start
      .otherwise(rshift);
    rshift.skipTo(start);


    sc = new ShiftChecker(b.properties);
    t.assert.throws(() => {   
      sc.check(start);
    }, /and will cause node .* to overflow./);

  });

  it('should detect inapproperate types', (t: TestContext) => {
    const rshift = b.rshift("defined", 8);
    const start = b.node('start');
        
    b.property('ptr', "defined");
        
    start
      .otherwise(rshift);
    rshift.skipTo(start);


    sc = new ShiftChecker(b.properties);
    t.assert.throws(() => {   
      sc.check(start);
    }, /defined cannot be provided to ".*" because field was defined as a "ptr"/);
  });

  it('should allow types that are smaller than itself', (t: TestContext) => {
    const rshift = b.rshift("defined", 2);
    const start = b.node('start');
        
    /* hypothetically let's say we have an uint32_t in C but we only 
        need to pack a i16 bit integer, this is valid use-case because we can safely
        back it even if the property is bigger than itself. */
    b.property('i32', "defined");
        
    start
      .otherwise(rshift);
    rshift.skipTo(start);


    sc = new ShiftChecker(b.properties);
    t.assert.doesNotThrow(() => sc.check(start));
  });



})