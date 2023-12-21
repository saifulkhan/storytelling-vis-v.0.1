import * as d3 from "d3";
import { Action } from "./Action";

export class Connector extends Action {
  protected connectorNode;
  protected props;
  protected y0: number;

  constructor(props: any = {}, id = "Dot") {
    super(id);

    this.props = {
      stroke: props?.stroke || "#4287f5",
      opacity: props?.opacity || 1,
    };
  }

  protected draw() {
    this.connectorNode = d3
      .create("svg")
      .append("line")
      .attr("stroke", this.props.stroke)
      .attr("opacity", this.props.opacity)
      .style("stroke-dasharray", "5,5")
      .node();
    this.node.appendChild(this.connectorNode);
  }

  public position(newX: number, newY: number, newY0: number) {
    this.x = newX;
    this.y = newY;
    this.y0 = newY0;

    d3.select(this.connectorNode)
      .attr("x1", this.x)
      .attr("x2", this.x)
      .attr("y1", this.y0)
      .attr("y2", this.y);
  }
}
