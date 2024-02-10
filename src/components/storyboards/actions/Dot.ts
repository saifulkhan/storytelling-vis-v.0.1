import * as d3 from "d3";
import { AbstractAction } from "./AbstractAction";
import { ActionEnum } from "./ActionEnum";

export type DotProperties = {
  id?: string;
  size?: number;
  color?: string;
  opacity?: number;
};

export class Dot extends AbstractAction {
  protected _properties: DotProperties;
  protected _dotNode;

  constructor() {
    super();
    this._type = ActionEnum.DOT;
  }

  public properties(properties: DotProperties = {}) {
    this._properties = {
      id: properties?.id || "Dot",
      size: properties?.size || 5,
      color: properties?.color || "#000000",
      opacity: properties?.opacity || 1,
    };

    return this;
  }

  protected _draw() {
    this._dotNode = d3
      .create("svg")
      .append("circle")
      .attr("r", this._properties.size)
      .attr("fill", this._properties.color)
      .attr("opacity", this._properties.opacity)
      .node();
    this._node.appendChild(this._dotNode);
  }

  public coordinate(x: number, y: number) {
    this._x = x;
    this._y = y;
    d3.select(this._dotNode).attr("cx", x).attr("cy", y);

    return this;
  }
}
