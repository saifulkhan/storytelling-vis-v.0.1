import * as d3 from "d3";
import { ActionEnum } from "./ActionEnum";

export type ActionsType = AbstractAction[];

export abstract class AbstractAction {
  protected _type: ActionEnum;
  protected _properties;
  protected _svg: SVGSVGElement;
  protected _node: HTMLElement;
  protected _x0;
  protected _y0;
  protected _x1;
  protected _y1;

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

  public svg(svg: SVGSVGElement) {
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
    // this._draw();
    return this;
  }

  public abstract draw();
  public abstract coordinate(x0: number, y0: number, x1: number, y1: number);

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

  public remove() {
    // TODO: use id?
    //d3.select(svg).select("svg").remove();
    return this;
  }

  // public static svgAll(actions: ActionsType, svg) {
  //   actions.map((d: AbstractAction) => d.svg(svg));
  // }

  // public static drawAll(actions: ActionsType) {
  //   actions.map((d: AbstractAction) => d.draw());
  // }

  // public static coordinateAll(
  //   actions: ActionsType,
  //   x0: number,
  //   y0: number,
  //   x1: number,
  //   y1: number,
  // ) {
  //   actions.map((d: AbstractAction) => d.coordinate(x0, y0, x1, y1));
  // }

  public static showAll(actions: ActionsType): Promise<any[]> {
    const promises = actions.map((d: AbstractAction) => d.show());
    return Promise.all(promises);
  }

  public static hideAll(actions: ActionsType) {
    const promises = actions.map((d: AbstractAction) => d.hide());
    return Promise.all(promises);
  }
}
