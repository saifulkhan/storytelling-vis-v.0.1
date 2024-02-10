import * as d3 from "d3";

import { findDateIdx } from "src/utils/storyboards/processing/common";
import { AbstractPlot } from "./AbstractPlot";
import { TimeseriesDataType } from "src/types/TimeseriesType";

const MARGIN = { top: 50, right: 50, bottom: 50, left: 50 };
const ID_AXIS_LABEL = "#id-axes-labels";

const YAXIS_LABEL_OFFSET = 10;
const MAGIC_NO = 10,
  FONT_SIZE = "12px",
  TITLE_FONT_SIZE = "14px";

const LINE_STROKE_WIDTH = 2;

type LinePlotProperties = {
  title?: string;
  ticks?: boolean;
  xLabel?: string;
  yLabel?: string;
  showPoints?: boolean;
  color?: string;
  sameScale?: boolean;
  yLabelX?: string;
  colorX?: string[];
};

export class LinePlot extends AbstractPlot {
  _data: TimeseriesDataType[];
  dataX: TimeseriesDataType[][];

  svgNode: SVGSVGElement;
  selector;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number } = MARGIN;

  _xScale: any;
  _yScale: any;
  _yScaleX: any;

  constructor() {
    super();

    console.log(`Timeseries: data = `, this._data, "dataX = ", this.dataX);
  }

  public properties(properties: LinePlotProperties = {}) {
    this._properties = {
      title: properties.title || "title...",
      ticks: properties.ticks || true,
      xLabel: properties.xLabel || "x-label...",
      yLabel: properties.yLabel || "y-label...",
      showPoints:
        typeof properties.showPoints === undefined
          ? false
          : properties.showPoints,
      color: properties.color || "#2a363b",
      sameScale:
        typeof properties.sameScale === undefined
          ? false
          : properties.sameScale,
      yLabelX: properties.yLabelX || "y-label X...",
      colorX: properties.colorX || ["#355c7d", "#99b898", "#E1999C"],
    };

    return this;
  }

  public data(
    data: TimeseriesDataType[],
    dataX: TimeseriesDataType[][] = undefined,
  ) {
    this._data = data;
    this.dataX = dataX;

    return this;
  }

  public draw(svg: SVGSVGElement) {
    this.svgNode = svg;
    const bounds = svg.getBoundingClientRect();
    this.height = 500; // bounds.height;
    this.width = 1400; // bounds.width; TODO
    console.log(bounds, this.width, this.height, this.margin);

    this.selector = d3
      .select(this.svgNode)
      .append("g")
      .attr("id", ID_AXIS_LABEL);

    this.drawAxis();
    this._draw();

    return this;
  }

  /*
   * Create axes and add labels
   */

  protected xScale(data: TimeseriesDataType[], w, m) {
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d: TimeseriesDataType) => d.date))
      .nice()
      .range([m.left, w - m.right]);
    return xScale;
  }

  protected yScale(data: TimeseriesDataType[], h, m) {
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d: TimeseriesDataType) => d.y)])
      .nice()
      .range([h - m.bottom, m.top]);
    return yScale;
  }

  private drawAxis() {
    // clear existing axes and labels
    d3.select(this.svgNode).selectAll(ID_AXIS_LABEL).remove();

    // combine all data before creating axis
    const combinedDataX = this.dataX?.reduce((comb, arr) => comb.concat(arr));
    const combinedAll = combinedDataX
      ? this._data.concat(combinedDataX)
      : this._data;

    this._xScale = this.xScale(combinedAll, this.width, this.margin);

    if (this.dataX && !this._properties.sameScale) {
      // y-axis are different scale
      this._yScale = this.yScale(this._data, this.height, this.margin);
      this._yScaleX = this.yScale(combinedDataX, this.height, this.margin);
    } else {
      // both y-axis are of same scale
      this._yScale = this.yScale(combinedAll, this.height, this.margin);
      this._yScaleX = this._yScale;
    }

    this.selector
      .append("g")
      .attr("transform", `translate(0, ${this.height - this.margin.bottom})`)
      .call(d3.axisBottom(this._xScale).ticks());
    this.selector
      .append("text")
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .attr("x", this.width / 2)
      .attr("y", this.height - 5)
      .text(`${this._properties.xLabel}→`);

    this.selector
      .append("g")
      .attr("transform", `translate(${this.margin.left}, 0)`)
      .call(
        d3.axisLeft(this._yScale),
        // .tickFormat((d) => {
        //   let prefix = d3.formatPrefix(".00", d);
        //   return prefix(d);
        // })
      );
    this.selector
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .attr("x", -this.height / 2)
      .attr("y", YAXIS_LABEL_OFFSET)
      .text(`${this._properties.yLabel}→`);

    if (this.dataX && !this._properties.sameScale) {
      this.selector
        .append("g")
        .attr("transform", `translate(${this.width - this.margin.right},0)`)
        .call(
          d3.axisRight(this._yScaleX),
          // .tickFormat((d) => {
          //   let prefix = d3.formatPrefix(".0", d);
          //   return prefix(d);
          // })
        );
      this.selector
        .append("text")
        .attr("transform", "rotate(90)")
        .attr("x", this.height / 2)
        .attr("y", -this.width + YAXIS_LABEL_OFFSET)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(`←${this._properties.yLabelX}`);
    }

    // title
    this.selector
      .append("text")
      .attr("fill", "currentColor")
      .style("fill", "#696969")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .style("font-size", TITLE_FONT_SIZE)
      .attr("x", this.width / 2)
      .attr("y", this.margin.top + MAGIC_NO)
      .text(this._properties.title);

    return this;
  }

  /*****************************************************************************
   ** Static timeseries
   *****************************************************************************/

  public _draw() {
    console.log("Timeseries: draw:");

    // draw data line
    this.selector
      .append("path")
      .attr("stroke", this._properties.color)
      .attr("stroke-width", LINE_STROKE_WIDTH)
      .attr("fill", "none")
      .attr(
        "d",
        d3
          .line()
          .x((d) => this._xScale(d.date))
          .y((d) => this._yScale(d.y))(this._data),
      );

    // draw all dataX lines
    if (this.dataX) {
      this.dataX.forEach((d, i) => {
        this.selector
          .append("path")
          .attr(
            "stroke",
            this._properties.colorX[i % this._properties.colorX.length],
          )
          .attr("stroke-width", LINE_STROKE_WIDTH)
          .attr("fill", "none")
          .attr(
            "d",
            d3
              .line()
              .x((d) => this._xScale(d.date))
              .y((d) => this._yScaleX(d.y))(d),
          );
      });
    }

    if (this._properties.showPoints) {
      // draw data points
      this.selector
        .append("g")
        .selectAll("circle")
        .data(this._data.map(Object.values))
        .join("circle")
        .attr("r", 3)
        .attr("cx", (d) => this._xScale(d[0]))
        .attr("cy", (d) => this._yScale(d[1]))
        .style("fill", this._properties.color)
        .attr("opacity", 0.4);

      // draw all dataX points
      if (this.dataX) {
        this.dataX.forEach((d, i) => {
          this.selector
            .append("g")
            .selectAll("circle")
            .data(d.map(Object.values))
            .join("circle")
            .attr("r", 3)
            .attr("cx", (d) => this._xScale(d[0]))
            .attr("cy", (d) => this._yScaleX(d[1]))
            .style(
              "fill",
              this._properties.colorX[i % this._properties.colorX.length],
            )
            .attr("opacity", 0.4);
        });
      }
    }
  }

  /*
   * Given a date of the timeseries, return the corresponding [x, y, x0, y0]
   * coordinates
   */
  public coordinates(date: Date): [number, number, number, number] {
    const d = this._data[findDateIdx(date, this._data)];
    return [
      this._xScale(d.date),
      this._yScale(d.y),
      this._xScale(d.date),
      this._yScale(0),
    ];
  }
}
