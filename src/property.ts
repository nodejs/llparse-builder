export type PropertyType = 'i8' | 'i16' | 'i32' | 'i64' | 'ptr';

export class Property {
  constructor(public readonly ty: PropertyType, public readonly name: string) {
    if (/^_/.test(name)) {
      throw new Error(`Can't use internal property name: "${name}"`);
    }
  }
}
