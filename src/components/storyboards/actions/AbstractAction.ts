import * as d3 from "d3";
import { ActionEnum } from "./ActionEnum";

export type ActionsOnDateType = { date: Date; actions: AbstractAction[] };

export abstract class AbstractAction {
  protected _type: ActionEnum;
  protected _properties;
  protected _svg: SVGSVGElement;
  protected _node: HTMLElement;
  protected _x;
  protected _y;

  constructor() {
    //
  }

  public abstract properties(properties: unknown);

  public get id(): string {
    return this._properties?.id;
  }

  public get type(): ActionEnum {
    return this._type;
  }

  public draw(svg: SVGSVGElement) {
    this._svg = svg;

    this._node = d3
      .create("svg")
      .append("g")
      .attr("id", this._properties?.id)
      // hide
      // .attr("display", "none")
      .node();
    // show
    // this.node.removeAttribute("display");

    d3.select(this._svg).append(() => this._node);
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
      d3.select(this._node)
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
      d3.select(this._node)
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
