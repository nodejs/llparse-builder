import * as code from './';

export class Creator {
  // Callbacks to external C functions

  public match(name: string): code.Match {
    return new code.Match(name);
  }

  public value(name: string): code.Value {
    return new code.Value(name);
  }

  public span(name: string): code.Span {
    return new code.Span(name);
  }

  // Helpers

  public store(field: string): code.Store {
    return new code.Store(field);
  }

  public load(field: string): code.Load {
    return new code.Load(field);
  }

  public mulAdd(field: string, options: code.IMulAddOptions): code.MulAdd {
    return new code.MulAdd(field, options);
  }

  public update(field: string, value: number): code.Update {
    return new code.Update(field, value);
  }

  public isEqual(field: string, value: number): code.IsEqual {
    return new code.IsEqual(field, value);
  }

  public or(field: string, value: number): code.Or {
    return new code.Or(field, value);
  }

  public test(field: string, value: number): code.Test {
    return new code.Test(field, value);
  }
}
