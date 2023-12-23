import { TimeseriesType } from "src/types/TimeseriesType";

export abstract class Workflow {
  protected initializationPromise: Promise<void>;
  protected _data: Record<string, TimeseriesType[]> = {};
  protected data: TimeseriesType[];

  protected key: string;

  constructor() {
    this.initializationPromise = this.initialize();
  }

  protected async initialize(): Promise<void> {
    await this.load();
  }

  waitForInitialization(): Promise<void> {
    return this.initializationPromise;
  }

  keys(): string[] {
    return Object.keys(this.data).sort();
  }

  filter(key: string) {
    this.key = key;
    this.data = this._data[key];
    // this.execute();
    this.translate();
  }

  protected abstract execute();
  protected abstract load();
  protected abstract translate();
}
