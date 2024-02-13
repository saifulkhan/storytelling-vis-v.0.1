import * as d3 from "d3";
import { TimeseriesDataType } from "../processing/TimeseriesDataType";

export abstract class AbstractWorkflow {
  protected initializationPromise: Promise<void>;
  protected _data: Record<string, TimeseriesDataType[]> = {};
  protected data: TimeseriesDataType[];
  protected _svg: SVGSVGElement;
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

  public draw(selector: string) {
    this._svg = d3
      .select(selector)
      .append("svg")
      .attr("width", 1200)
      .attr("height", 500)
      .node();

    console.log("Workflow:draw: svg = ", this._svg);
  }

  keys(): string[] {
    return Object.keys(this._data).sort();
  }

  filter(key: string) {
    this.key = key;
    this.data = this._data[key];
    this.create();
  }

  protected abstract load();
  protected abstract create();
}
