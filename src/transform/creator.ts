import { Transform } from './base';

export class Creator {
  public toLowerUnsafe(): Transform {
    return new Transform('to_lower_unsafe');
  }
}
