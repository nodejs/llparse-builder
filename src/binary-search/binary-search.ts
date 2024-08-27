/**
 * @param haystack
 * @param needle
 * @param comparator Notes about comparator return value:
 *   when a<b the comparator's returned value should be:
 *   negative number or a value such that `+value` is a negative number
 *   examples: `-1` or the string `"-1"`
 *   when a>b the comparator's returned value should be:
 *   positive number or a value such that `+value` is a positive number
 *   examples: `1` or the string `"1"`
 *   when a===b
 * any value other than the return cases for a<b and a>b
 * examples: undefined, NaN, 'abc'
 * @param low
 * @param high
 * @returns {number} returns index of found result or number < 0 if not found
 */
export function binarySearch<A, B>(
    haystack: ArrayLike<A>,
    needle: B,
    comparator: (a: A, b: B, index?: number, haystack?: ArrayLike<A>) => any,
    low?: number,
    high?: number): number {
    let mid;
    let cmp;

    if (low === undefined) {
      low = 0;
    } else {
      low = low | 0;
      if (low < 0 || low >= haystack.length) {
        throw new RangeError('invalid lower bound');
      }
    }

    if (high === undefined) {
      high = haystack.length - 1;
    } else {
      high = high | 0;
      if (high < low || high >= haystack.length) {
        throw new RangeError('invalid upper bound');
      }
    }

    while (low <= high) {
      // The naive `low + high >>> 1` could fail for array lengths > 2**31
      // because `>>>` converts its operands to int32. `low + (high - low >>> 1)`
      // works for array lengths <= 2**32-1 which is also Javascript's max array
      // length.
      mid = low + ((high - low) >>> 1);
      cmp = +comparator(haystack[mid], needle, mid, haystack);

      // Too low.
      if (cmp < 0.0) {
        low  = mid + 1;
      } else if (cmp > 0.0) {
        high = mid - 1;
 } else {
        return mid;
 }
    }

    // Key not found.
    return ~low;
  }
