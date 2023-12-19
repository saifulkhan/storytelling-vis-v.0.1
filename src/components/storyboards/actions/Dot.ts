import * as d3 from "d3";
import { Action } from "./Action";

export class Dot extends Action {
  protected dotNode;
  protected props;

  constructor(props: any = {}, id = "Dot") {
    super(id);

    this.props = {
      size: props?.size || 5,
      color: props?.color || "#000000",
      opacity: props?.opacity || 1,
    };
  }

  protected draw() {
    this.dotNode = d3
      .create("svg")
      .append("circle")
      .attr("r", this.props.size)
      .attr("fill", this.props.color)
      .attr("opacity", this.props.opacity)
      .node();
    this.node.appendChild(this.dotNode);
    this.reposition(this.x, this.y);
  }

  public reposition(newX: number, newY: number) {
    this.x = newX;
    this.y = newY;
    d3.select(this.dotNode).attr("cx", newX).attr("cy", newY);
  }
}
