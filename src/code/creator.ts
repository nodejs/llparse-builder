import * as code from './';

/**
 * API for creating external callbacks and intrinsic operations.
 */
export class Creator {
  // Callbacks to external C functions

  /**
   * Create an external callback that **has no** `value` argument.
   *
   * This callback can be used in all `Invoke` nodes except those that are
   * targets of `.select()` method.
   *
   * C signature of callback must be:
   *
   * ```c
   * int name(llparse_t* state, const char* p, const char* endp)
   * ```
   *
   * Where `llparse_t` is parser state's type name.
   *
   * @param name External function name.
   */
  public match(name: string): code.Match {
    return new code.Match(name);
  }

  /**
   * Create an external callback that **has** `value` argument.
   *
   * This callback can be used only in `Invoke` nodes that are targets of
   * `.select()` method.
   *
   * C signature of callback must be:
   *
   * ```c
   * int name(llparse_t* state, const char* p, const char* endp, int value)
   * ```
   *
   * Where `llparse_t` is parser state's type name.
   *
   * @param name External function name.
   */
  public value(name: string): code.Value {
    return new code.Value(name);
  }

  /**
   * Create an external span callback.
   *
   * This callback can be used only in `Span` constructor.
   *
   * C signature of callback must be:
   *
   * ```c
   * int name(llparse_t* state, const char* p, const char* endp)
   * ```
   *
   * NOTE: non-zero return value is treated as resumable error.
   *
   * @param name External function name.
   */
  public span(name: string): code.Span {
    return new code.Span(name);
  }

  // Helpers

  /**
   * Intrinsic operation. Stores `value` from `.select()` node into the state's
   * property with the name specified by `field`, returns zero.
   *
   *   state[field] = value;
   *   return 0;
   *
   * @param field  Property name
   */
  public store(field: string): code.Store {
    return new code.Store(field);
  }

  /**
   * Intrinsic operation. Loads and returns state's property with the name
   * specified by `field`.
   *
   * The value of the property is either truncated or zero-extended to fit into
   * 32-bit unsigned integer.
   *
   *   return state[field];
   *
   * @param field  Property name.
   */
  public load(field: string): code.Load {
    return new code.Load(field);
  }

  /**
   * Intrinsic operation. Takes `value` from `.select()`, state's property
   * with the name `field` and does:
   *
   *   field = state[field];
   *   field *= options.base;
   *   field += value;
   *   state[field] = field;
   *   return 0;  // or 1 on overflow
   *
   * Return values are:
   *
   * - 0 - success
   * - 1 - overflow
   *
   * @param field    Property name
   * @param options  See `code.MulAdd` documentation.
   */
  public mulAdd(field: string, options: code.IMulAddOptions): code.MulAdd {
    return new code.MulAdd(field, options);
  }

  /**
   * Intrinsic operation. Puts `value` integer into the state's property with
   * the name specified by `field`.
   *
   *   state[field] = value;
   *   return 0;
   *
   * @param field Property name
   * @param value Integer value to be stored into the property.
   */
  public update(field: string, value: number): code.Update {
    return new code.Update(field, value);
  }

  /**
   * Intrinsic operation. Returns 1 if the integer `value` is equal to the
   * state's property with the name specified by `field`.
   *
   *   return state[field] === value ? 1 : 0;
   *
   * @param field Property name
   * @param value Integer value to be checked against.
   */
  public isEqual(field: string, value: number): code.IsEqual {
    return new code.IsEqual(field, value);
  }

  /**
   * Intrinsic operation.
   *
   *   state[field] &= value
   *   return 0;
   *
   * @param field Property name
   * @param value Integer value
   */
  public and(field: string, value: number): code.And {
    return new code.And(field, value);
  }

  /**
   * Intrinsic operation.
   *
   *   state[field] |= value
   *   return 0;
   *
   * @param field Property name
   * @param value Integer value
   */
  public or(field: string, value: number): code.Or {
    return new code.Or(field, value);
  }

  /**
   * Intrinsic operation.
   *
   *   return (state[field] & value) == value ? 1 : 0;
   *
   * @param field Property name
   * @param value Integer value
   */
  public test(field: string, value: number): code.Test {
    return new code.Test(field, value);
  }
}
