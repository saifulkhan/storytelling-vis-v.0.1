import * as d3 from "d3";
import { AbstractAction } from "./AbstractAction";
import { ActionEnum } from "./ActionEnum";

export type ConnectorProperties = {
  id?: string;
  stroke?: string;
  opacity?: number;
};

export class Connector extends AbstractAction {
  protected _properties: ConnectorProperties;
  protected connectorNode;
  protected props;
  protected x0: number;
  protected y0: number;

  constructor() {
    super();
    this._type = ActionEnum.CONNECTOR;
  }

  public properties(properties: ConnectorProperties = {}) {
    this._properties = {
      stroke: properties?.stroke || "#000000",
      opacity: properties?.opacity || 1,
    };

    return this;
  }

  protected _draw() {
    this.connectorNode = d3
      .create("svg")
      .append("line")
      .attr("stroke", this._properties.stroke)
      .attr("opacity", this._properties.opacity)
      .style("stroke-dasharray", "5,5")
      .node();
    this.node.appendChild(this.connectorNode);
  }

  public coordinate(x: number, y: number, x0: number, y0: number) {
    this.x = x;
    this.y = y;
    this.x0 = x0;
    this.y0 = y0;

    d3.select(this.connectorNode)
      .attr("x1", this.x0)
      .attr("x2", this.x)
      .attr("y1", this.y0)
      .attr("y2", this.y);

    return this;
  }
}
