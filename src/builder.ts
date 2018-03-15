import * as code from './code';
import * as node from './node';
import { Property, PropertyType } from './property';
import { Span } from './span';
import * as transform from './transform';

export { code, node, transform, Property, PropertyType, Span };

export class Builder {
  public readonly code: code.Creator = new code.Creator();
  public readonly transform: transform.Creator = new transform.Creator();
  private readonly privProperties: Map<string, Property> = new Map();

  // Various nodes

  public node(name: string): node.Match {
    return new node.Match(name);
  }

  public error(errorCode: number, reason: string): node.Error {
    return new node.Error(errorCode, reason);
  }

  public invoke(fn: code.Code, map?: node.IInvokeMap | node.Node,
                otherwise?: node.Node): node.Invoke {
    let res: node.Invoke;

    // `.invoke(name)`
    if (map === undefined) {
      res = new node.Invoke(fn, {});
      // `.invoke(name, otherwise)`
    } else if (map instanceof node.Node) {
      res = new node.Invoke(fn, {});
    } else {
      res = new node.Invoke(fn, map as node.IInvokeMap);
    }

    if (otherwise !== undefined) {
      res.otherwise(otherwise);
    }
    return res;
  }

  public consume(field: string): node.Consume {
    return new node.Consume(field);
  }

  public pause(errorCode: number, reason: string): node.Pause {
    return new node.Pause(errorCode, reason);
  }

  // Span

  public span(callback: code.Span): Span {
    return new Span(callback);
  }

  // Custom property API

  public property(ty: PropertyType, name: string): void {
    if (this.privProperties.has(name)) {
      throw new Error(`Duplicate property with a name: "${name}"`);
    }

    const prop = new Property(ty, name);
    this.privProperties.set(name, prop);
  }

  public get properties(): ReadonlyArray<Property> {
    return Array.from(this.privProperties.values());
  }
}
