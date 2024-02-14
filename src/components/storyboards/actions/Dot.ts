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

  public draw() {
    this._dotNode = d3
      .create("svg")
      .append("circle")
      .attr("r", this._properties.size)
      .attr("fill", this._properties.color)
      .attr("opacity", this._properties.opacity)
      .node();
    this._node.appendChild(this._dotNode);

    return this;
  }

  public coordinate(x0: number, y0: number, x1: number, y1: number) {
    this._x0 = x0;
    this._y0 = y0;
    this._x1 = x1;
    this._y1 = y1;

    d3.select(this._dotNode).attr("cx", x1).attr("cy", y1);

    return this;
  }
}
