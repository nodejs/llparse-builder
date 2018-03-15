import { Code } from './code';
import * as node from './node';
import { Property, PropertyType } from './property';
import { Span } from './span';

export class Builder {
  private readonly privProperties: Map<string, Property> = new Map();

  public get properties(): ReadonlyArray<Property> {
    return Array.from(this.privProperties.values());
  }

  public node(name: string): node.Match {
    return new node.Match(name);
  }

  public error(code: number, reason: string): node.Error {
    return new node.Error(code, reason);
  }

  public invoke(code: Code, map: node.IInvokeMap | node.Node | undefined,
                otherwise?: node.Node): node.Invoke {
    let res: node.Invoke;

    // `.invoke(name)`
    if (map === undefined) {
      res = new node.Invoke(code, {});
      // `.invoke(name, otherwise)`
    } else if (map instanceof node.Node) {
      res = new node.Invoke(code, {});
    } else {
      res = new node.Invoke(code, map as node.InvokeMap);
    }

    if (otherwise !== undefined) {
      res.otherwise(otherwise);
    }
    return res;
  }

  public consume(field: string): node.Consume {
    return new node.Consume(field);
  }

  public pause(code: number, reason: string): node.Pause {
    return new node.Pause(code, reason);
  }

  public property(ty: PropertyType, name: string): void {
    if (this.privProperties.has(name)) {
      throw new Error(`Duplicate property with a name: "${name}"`);
    }

    const prop = new Property(ty, name);
    this.privProperties.set(name, prop);
  }

  public span(code: Code): Span {
    return new Span(code);
  }
}
