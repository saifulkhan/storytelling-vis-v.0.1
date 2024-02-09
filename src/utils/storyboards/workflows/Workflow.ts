import * as d3 from "d3";
import { TimeseriesDataType } from "src/types/TimeseriesType";

export abstract class Workflow {
  protected initializationPromise: Promise<void>;
  protected _data: Record<string, TimeseriesDataType[]> = {};
  protected data: TimeseriesDataType[];
  protected svgNode: SVGSVGElement;
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

  public drawOn(selector: string) {
    this.svgNode = d3
      .select(selector)
      .append("svg")
      .attr("width", 1200)
      .attr("height", 500)
      .node();

    console.log("svgNode = ", this.svgNode);
  }

  keys(): string[] {
    return Object.keys(this._data).sort();
  }

  filter(key: string) {
    this.key = key;
    this.data = this._data[key];
    this.setup();
  }

  protected abstract load();
  protected abstract setup();
}
