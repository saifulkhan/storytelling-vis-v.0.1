import * as d3 from "d3";
import { ActionType } from "../../../types/ActionType";

export abstract class Action {
  protected _type: ActionType;
  protected _properties;
  protected _svg: SVGSVGElement;
  protected node: HTMLElement;
  protected x;
  protected y;

  constructor() {
    //
  }

  public abstract properties(properties: unknown);

  public get id(): string {
    return this._properties?.id;
  }

  public get type(): ActionType {
    return this._type;
  }

  public draw(svg: SVGSVGElement) {
    this._svg = svg;

    this.node = d3
      .create("svg")
      .append("g")
      .attr("id", this._properties?.id)
      // hide
      // .attr("display", "none")
      .node();
    // show
    // this.node.removeAttribute("display");

    d3.select(this._svg).append(() => this.node);
    this._draw();

    return this;
  }

  public remove() {
    // TODO: use id?
    //d3.select(svg).select("svg").remove();
    return this;
  }

  protected abstract _draw();
  public abstract coordinate(x: number, y: number, x0: number, y0: number);

  public show(delay = 0, duration = 1000) {
    return new Promise<number>((resolve, reject) => {
      d3.select(this.node)
        .transition()
        .delay(delay)
        .duration(duration)
        .attr("opacity", 1)
        .on("end", () => {
          resolve(delay + duration);
        });
    });
  }

  public hide(delay = 0, duration = 1000) {
    return new Promise<number>((resolve, reject) => {
      d3.select(this.node)
        .transition()
        .delay(delay)
        .duration(duration)
        .attr("opacity", 0)
        .on("end", () => {
          resolve(delay + duration);
        });
    });
  }
}
