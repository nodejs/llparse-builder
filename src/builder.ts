import * as code from './code';
import * as node from './node';
import { Property, PropertyType } from './property';
import { Span } from './span';
import * as transform from './transform';

export { code, node, transform, Property, PropertyType, Span };
export { Edge } from './edge';
export { LoopChecker } from './loop-checker';
export { ISpanAllocatorResult, SpanAllocator } from './span-allocator';
export { Reachability } from './reachability';

/**
 * Construct parsing graph for later use in `llparse`.
 */
export class Builder {
  /**
   * API for creating external callbacks and intrinsic operations.
   */
  public readonly code: code.Creator = new code.Creator();

  /**
   * API for creating character transforms for use in nodes created with
   * `builder.node()`
   */
  public readonly transform: transform.Creator = new transform.Creator();

  private readonly privProperties: Map<string, Property> = new Map();

  // Various nodes

  /**
   * Create regular node for matching characters and sequences.
   *
   * @param name Node name
   */
  public node(name: string): node.Match {
    return new node.Match(name);
  }

  /**
   * Create terminal error node. Returns error code to user, and sets reason
   * in the parser's state object.
   *
   * This node does not consume any bytes upon execution.
   *
   * @param errorCode Integer error code
   * @param reason    Error description
   */
  public error(errorCode: number, reason: string): node.Error {
    return new node.Error(errorCode, reason);
  }

  /**
   * Create invoke node that calls either external user callback or an
   * intrinsic operation.
   *
   * This node does not consume any bytes upon execution.
   *
   * NOTE: When `.invoke()` is a target of `node().select()` - callback must
   * have signature that accepts `.select()`'s value, otherwise it must be of
   * the signature that takes no such value.
   *
   * @param fn        Code instance to invoke
   * @param map       Object with integer keys and `Node` values. Describes
   *                  nodes that are visited upon receiving particular
   *                  return integer value
   * @param otherwise Convenience `Node` argument. Effect is the same as calling
   *                  `p.invoke(...).otherwise(node)`
   */
  public invoke(fn: code.Code, map?: node.IInvokeMap | node.Node,
                otherwise?: node.Node): node.Invoke {
    let res: node.Invoke;

    // `.invoke(name)`
    if (map === undefined) {
      res = new node.Invoke(fn, {});
      // `.invoke(name, otherwise)`
    } else if (map instanceof node.Node) {
      res = new node.Invoke(fn, {});
      otherwise = map;
    } else {
      res = new node.Invoke(fn, map as node.IInvokeMap);
    }

    if (otherwise !== undefined) {
      res.otherwise(otherwise);
    }
    return res;
  }

  /**
   * Create node that consumes number of bytes specified by value of the
   * state's property with name in `field` argument.
   *
   * @param field Property name to use
   */
  public consume(field: string): node.Consume {
    return new node.Consume(field);
  }

  /**
   * Create non-terminal node that returns `errorCode` as error number to
   * user, but still allows feeding more data to the parser.
   *
   * This node does not consume any bytes upon execution.
   *
   * @param errorCode Integer error code
   * @param reason    Error description
   */
  public pause(errorCode: number, reason: string): node.Pause {
    return new node.Pause(errorCode, reason);
  }

  // Span

  /**
   * Create Span with given `callback`.
   *
   * @param callback  External span callback, must be result of
   *                  `.code.span(...)`
   */
  public span(callback: code.Span): Span {
    return new Span(callback);
  }

  // Custom property API

  /**
   * Allocate space for property in parser's state.
   */
  public property(ty: PropertyType, name: string): void {
    if (this.privProperties.has(name)) {
      throw new Error(`Duplicate property with a name: "${name}"`);
    }

    const prop = new Property(ty, name);
    this.privProperties.set(name, prop);
  }

  /**
   * Return list of all allocated properties in parser's state.
   */
  public get properties(): ReadonlyArray<Property> {
    return Array.from(this.privProperties.values());
  }
}
