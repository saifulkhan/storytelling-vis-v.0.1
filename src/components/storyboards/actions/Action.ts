import * as d3 from "d3";
import { ActionType } from "../../../types/ActionType";

export abstract class Action {
  protected _type: ActionType;
  protected _id: string;
  protected node: HTMLElement;
  protected svg: HTMLElement;
  protected x;
  protected y;

  constructor(id: string) {
    this._id = id;

    this.node = d3
      .create("svg")
      .append("g")
      .attr("id", this._id)
      // hide
      // .attr("display", "none")
      .node();

    // show
    // this.node.removeAttribute("display");
  }

  public drawOn(svg) {
    d3.select(svg).append(() => this.node);
    this.draw();
    return this;
  }

  public removeFrom(svg) {
    // TODO: use id?
    //d3.select(svg).select("svg").remove();
    return this;
  }

  public show(delay = 100) {
    d3.select(this.node)
      .transition()
      .delay(delay)
      .duration(0)
      .attr("opacity", 1)
      .on("end", () => {
        // animation completed, do something if needed
        // cb
        console.log("show on end");
      });
    return delay;
  }

  public hide(delay = 100) {
    d3.select(this.node)
      .transition()
      .delay(delay)
      .duration(0)
      .attr("opacity", 0)
      .on("end", () => {
        // animation completed, do something if needed
        // cb
        console.log("hide on end");
      });
    return delay;
  }

  public get id() {
    return this._id;
  }

  public get type() {
    return this._type;
  }

  protected abstract draw();
  public abstract position(x: number, y: number, y0: number);
}
