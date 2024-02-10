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

  protected _draw() {
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
  }

  public coordinate(x: number, y: number) {
    this._x = x;
    this._y = y;
    d3.select(this._circleNode).attr("cx", x).attr("cy", y);

    return this;
  }
}
