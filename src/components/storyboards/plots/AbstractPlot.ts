import * as d3 from "d3";

export abstract class AbstractPlot {
  protected _svg: SVGSVGElement;
  protected node: HTMLElement;

  constructor() {
    //
  }
  public abstract data(data: unknown, dataX: unknown);
  public abstract draw(svg: SVGSVGElement);

  public abstract coordinates(date: Date): [number, number, number, number];
}
