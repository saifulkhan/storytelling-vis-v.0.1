import * as d3 from "d3";
import { Action } from "./Action";
import { ActionType } from "../../../types/ActionType";

export class Dot extends Action {
  protected dotNode;
  protected props;

  constructor(props: any = {}, id = ActionType.DOT) {
    super(id);
    this._type = ActionType.DOT;

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
  }

  public coordinate(x: number, y: number) {
    this.x = x;
    this.y = y;
    d3.select(this.dotNode).attr("cx", x).attr("cy", y);
  }
}
