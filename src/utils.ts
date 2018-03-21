import * as assert from 'assert';
import { Buffer } from 'buffer';

/**
 * Internal
 */
export function toBuffer(value: number | string | Buffer): Buffer {
  let res: Buffer;
  if (Buffer.isBuffer(value)) {
    res = value;
  } else if (typeof value === 'string') {
    res = Buffer.from(value);
  } else {
    assert(0 <= value && value <= 0xff, 'Invalid byte value');
    res = Buffer.from([ value ]);
  }
  assert(res.length >= 1, 'Invalid key length');
  return res;
}
