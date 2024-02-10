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
  protected _connectorNode;
  protected _x0: number;
  protected _y0: number;

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
    this._connectorNode = d3
      .create("svg")
      .append("line")
      .attr("stroke", this._properties.stroke)
      .attr("opacity", this._properties.opacity)
      .style("stroke-dasharray", "5,5")
      .node();
    this._node.appendChild(this._connectorNode);
  }

  public coordinate(x: number, y: number, x0: number, y0: number) {
    this._x = x;
    this._y = y;
    this._x0 = x0;
    this._y0 = y0;

    d3.select(this._connectorNode)
      .attr("x1", this._x0)
      .attr("x2", this._x)
      .attr("y1", this._y0)
      .attr("y2", this._y);

    return this;
  }
}
