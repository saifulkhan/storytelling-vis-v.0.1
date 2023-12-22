import * as d3 from "d3";
import { Action } from "./Action";
import { ActionType } from "./ActionType";

export class Circle extends Action {
  protected circleNode;
  protected props;

  constructor(props: any = {}, id = ActionType.CIRCLE) {
    super(id);
    this._type = ActionType.CIRCLE;

    this.props = {
      size: props?.size || 10,
      strokeWidth: props.strokeWidth || 2,
      color: props?.color || "#000000",
      opacity: props?.opacity || 1,
    };
  }

  protected draw() {
    this.circleNode = d3
      .create("svg")
      .append("circle")
      .attr("fill", "none")
      .attr("r", this.props.size)
      .attr("stroke-width", this.props.strokeWidth)
      .attr("stroke", this.props.color)
      .attr("opacity", this.props.opacity)
      .node();
    this.node.appendChild(this.circleNode);
  }

  public position(x: number, y: number) {
    this.x = x;
    this.y = y;
    d3.select(this.circleNode).attr("cx", x).attr("cy", y);
  }
}
