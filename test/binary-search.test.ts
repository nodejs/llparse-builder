import { describe, it, type TestContext } from 'node:test';
import { binarySearch } from '../src/binary-search/binary-search';

describe('binarysearch', () => {
  const arr = [1, 2, 2, 2, 3, 5, 9];
  const cmp = (a: number, b: number) => a - b;

  it('should bail if not passed an array', (t: TestContext) => {
    // @ts-expect-error
    t.assert.throws(() => { binarySearch(undefined, 3, cmp); }, TypeError);
  });

  it('should bail if not passed a comparator', (t: TestContext) => {
    // @ts-expect-error
    t.assert.throws(() => { binarySearch(arr, 3, undefined); }, TypeError);
  });

  it('should return the index of an item in a sorted array', (t: TestContext) => {
    t.assert.strictEqual(binarySearch(arr, 3, cmp), 4);
  });

  it('should return the index of where the item would go plus one, negated, if the item is not found',
    (t: TestContext) => {
      t.assert.strictEqual(binarySearch(arr, 4, cmp), -6);
    });

  it('should return any valid index if an item exists multiple times in the array',
    (t: TestContext) => {
      t.assert.strictEqual(binarySearch(arr, 2, cmp), 3);
    });

  it('should work even on empty arrays', (t: TestContext) => {
    t.assert.strictEqual(binarySearch([], 42, cmp), -1);
  });

  it('should work even on arrays of doubles', (t: TestContext) => {
    t.assert.strictEqual(binarySearch([0.0, 0.1, 0.2, 0.3, 0.4], 0.25, cmp), -4);
  });

  it('should pass the index and array parameters to the comparator', (t: TestContext) => {
    const indexes: number[] = [];
    const indexCmp = (a: number, b: number, i?: number, array?: ArrayLike<number>) => {
      t.assert.strictEqual(array, arr);
      indexes.push(i!);
      return cmp(a, b);
    };
    binarySearch(arr, 3, indexCmp);
    t.assert.deepStrictEqual(indexes, [3, 5, 4]);
  });
});
