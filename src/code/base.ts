export type Signature = 'match' | 'value';

export abstract class Code {
  protected isExternalFlag: boolean = false;

  constructor(public readonly signature: Signature,
              public readonly name: string) {
  }

  public isExternal(): boolean {
    return this.isExternalFlag;
  }

  protected markExternal(): void {
    this.isExternalFlag = true;
  }
}
