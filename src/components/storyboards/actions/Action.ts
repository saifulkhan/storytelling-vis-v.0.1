import * as d3 from "d3";

export abstract class Action {
  protected node: HTMLElement;
  protected svg: HTMLElement;
  protected id: string;
  protected x = 0;
  protected y = 0;

  constructor(id: string) {
    this.id = id;

    this.node = d3
      .create("svg")
      .append("g")
      .attr("id", this.id)
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

  protected abstract draw();
  public abstract reposition(newX: number, newY: number);
}
