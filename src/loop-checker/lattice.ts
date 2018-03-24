import * as assert from 'assert';

const MAX_VALUE = 256;
const WORD_SIZE = 32;
const SIZE = (MAX_VALUE / WORD_SIZE) | 0;
const WORD_FILL = -1 | 0;

assert.strictEqual(MAX_VALUE % WORD_SIZE, 0);

export type LatticeValue = 'empty' | ReadonlyArray<number> | 'any';

/**
 * A fixed-size bitfield, really
 */
export class Lattice {
  protected readonly words: number[];

  constructor(value: LatticeValue) {
    this.words = new Array(SIZE).fill(value === 'any' ? WORD_FILL : 0);

    if (Array.isArray(value)) {
      for (const single of value) {
        this.add(single);
      }
    }
  }

  public check(bit: number): boolean {
    assert(0 <= bit && bit < MAX_VALUE, 'Invalid bit');
    const index = (bit / WORD_SIZE) | 0;
    const off = bit % WORD_SIZE;
    return (this.words[index] & (1 << off)) !== 0;
  }

  public union(other: Lattice): Lattice {
    const result = new Lattice('empty');

    for (let i = 0; i < SIZE; i++) {
      result.words[i] = this.words[i] | other.words[i];
    }

    return result;
  }

  public intersect(other: Lattice): Lattice {
    const result = new Lattice('empty');

    for (let i = 0; i < SIZE; i++) {
      result.words[i] = this.words[i] & other.words[i];
    }

    return result;
  }

  public subtract(other: Lattice): Lattice {
    const result = new Lattice('empty');

    for (let i = 0; i < SIZE; i++) {
      result.words[i] = this.words[i] & (~other.words[i]);
    }

    return result;
  }

  public isEqual(other: Lattice): boolean {
    if (this === other) {
      return true;
    }

    for (let i = 0; i < SIZE; i++) {
      if (this.words[i] !== other.words[i]) {
        return false;
      }
    }
    return true;
  }

  public *[Symbol.iterator](): Iterator<number> {
    // TODO(indutny): improve speed if needed
    for (let i = 0; i < MAX_VALUE; i++) {
      if (this.check(i)) {
        yield i;
      }
    }
  }

  public toJSON(): any {
    let isEmpty = true;
    let isFull = true;
    for (let i = 0; i < SIZE; i++) {
      if (this.words[i] !== 0) {
        isEmpty = false;
      }
      if (this.words[i] !== WORD_FILL) {
        isFull = false;
      }
    }
    if (isEmpty) {
      return 'empty';
    }
    if (isFull) {
      return 'any';
    }
    return Array.from(this);
  }

  // Private

  private add(bit: number): void {
    assert(0 <= bit && bit < MAX_VALUE, 'Invalid bit');
    const index = (bit / WORD_SIZE) | 0;
    const off = bit % WORD_SIZE;
    this.words[index] |= 1 << off;
  }
}
