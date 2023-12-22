import { TimeseriesType } from "../TimeseriesType";

export abstract class Workflow {
  protected initializationPromise: Promise<void>;
  protected data: Record<string, TimeseriesType[]> = {};
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
    this.execute();
  }

  /*
   * Implement execution sequences
   */
  protected execute() {
    return;
  }

  /*
   * Implement load data
   */
  protected async load() {
    return;
  }
}
