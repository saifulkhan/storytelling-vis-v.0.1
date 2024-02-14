import * as d3 from "d3";
import { AbstractAction } from "./AbstractAction";
import { ActionEnum } from "./ActionEnum";

export type CircleProperties = {
  id?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  opacity?: number;
};

export class Circle extends AbstractAction {
  protected _properties: CircleProperties;
  protected _circleNode;

  constructor() {
    super();
    this._type = ActionEnum.CIRCLE;
  }

  public properties(properties: CircleProperties = {}) {
    this._properties = {
      id: properties?.id || "Circle",
      size: properties?.size || 10,
      strokeWidth: properties?.strokeWidth || 2,
      color: properties?.color || "#000000",
      opacity: properties?.opacity || 1,
    };

    return this;
  }

  public draw() {
    this._circleNode = d3
      .create("svg")
      .append("circle")
      .attr("fill", "none")
      .attr("r", this._properties.size)
      .attr("stroke-width", this._properties.strokeWidth)
      .attr("stroke", this._properties.color)
      .attr("opacity", this._properties.opacity)
      .node();
    this._node.appendChild(this._circleNode);

    return this;
  }

  public coordinate(x0: number, y0: number, x1: number, y1: number) {
    this._x0 = x0;
    this._y0 = y0;
    this._x1 = x1;
    this._y1 = y1;

    d3.select(this._circleNode).attr("cx", x1).attr("cy", y1);

    return this;
  }
}
