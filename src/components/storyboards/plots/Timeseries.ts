import * as d3 from "d3";

import { TimeseriesType } from "src/utils/storyboards/TimeseriesType";
import { AnimationType } from "src/models/AnimationType";
import { NumericalFeatureType } from "../../../utils/storyboards/processing/NumericalFeatureType";
import { GraphAnnotation, TSPAnnotation } from "./GraphAnnotation";
import { findDateIdx } from "src/utils/storyboards/processing/common";

const MARGIN = { top: 50, right: 50, bottom: 50, left: 50 };
const ID_AXIS_LABEL = "#id-axes-labels";

const YAXIS_LABEL_OFFSET = 10;
const MAGIC_NO = 10,
  FONT_SIZE = "12px",
  TITLE_FONT_SIZE = "14px";

const LINE_STROKE_WIDTH = 2;

export class Timeseries {
  props: any;
  data: TimeseriesType[];
  dataX: TimeseriesType[][];

  svgNode: SVGSVGElement;
  selector;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number } = MARGIN;

  _xScale: any;
  _yScale: any;
  _yScaleX: any;

  constructor(
    props: any = {},
    data: TimeseriesType[],
    dataX: TimeseriesType[][] = undefined,
  ) {
    this.props = {
      title: props.title || "title...",
      ticks: props.ticks || true,
      xLabel: props.xLabel || "x-label...",
      yLabel: props.yLabel || "y-label...",
      showPoints:
        typeof props.showPoints != "boolean" ? true : props.showPoints,
      color: props.color || "#2a363b",
      sameScale: typeof props.sameScale != "boolean" ? true : props.sameScale,
      yLabelX: props.yLabelX || "y-label X...",
      colorX: props.colorX || ["#355c7d", "#99b898", "#E1999C"],
    };

    this.data = data;
    this.dataX = dataX;

    console.log(`Timeseries: data = `, this.data, "dataX = ", this.dataX);
  }

  public drawOn(svg: SVGSVGElement) {
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
    return this;
  }

  /*
   * Create axes and add labels
   */

  protected xScale(data: TimeseriesType[], w, m) {
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d: TimeseriesType) => d.date))
      .nice()
      .range([m.left, w - m.right]);
    return xScale;
  }

  protected yScale(data: TimeseriesType[], h, m) {
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d: TimeseriesType) => d.y)])
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
      ? this.data.concat(combinedDataX)
      : this.data;

    this._xScale = this.xScale(combinedAll, this.width, this.margin);

    if (this.dataX && !this.props.sameScale) {
      // y-axis are different scale
      this._yScale = this.yScale(this.data, this.height, this.margin);
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
      .text(`${this.props.xLabel}→`);

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
      .text(`${this.props.yLabel}→`);

    if (this.dataX && !this.props.sameScale) {
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
        .text(`←${this.props.yLabelX}`);
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
      .text(this.props.title);

    return this;
  }

  /*****************************************************************************
   ** Static timeseries
   *****************************************************************************/

  public draw() {
    console.log("Timeseries: draw:");

    // draw data line
    this.selector
      .append("path")
      .attr("stroke", this.props.color)
      .attr("stroke-width", LINE_STROKE_WIDTH)
      .attr("fill", "none")
      .attr(
        "d",
        d3
          .line()
          .x((d) => this._xScale(d.date))
          .y((d) => this._yScale(d.y))(this.data),
      );

    // draw all dataX lines
    if (this.dataX) {
      this.dataX.forEach((d, i) => {
        this.selector
          .append("path")
          .attr("stroke", this.props.colorX[i % this.props.colorX.length])
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

    if (this.props.showPoints) {
      // draw data points
      this.selector
        .append("g")
        .selectAll("circle")
        .data(this.data.map(Object.values))
        .join("circle")
        .attr("r", 3)
        .attr("cx", (d) => this._xScale(d[0]))
        .attr("cy", (d) => this._yScale(d[1]))
        .style("fill", this.props.color);

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
            .style("fill", this.props.colorX[i % this.props.colorX.length]);
        });
      }
    }
  }

  /*
   * Given a date of the timeseries, return the corresponding [x, y0, x, y]
   * coordinates
   */
  public coordinates(date: Date): [number, number, number, number] {
    const d = this.data[findDateIdx(date, this.data)];
    return [
      this._xScale(d.date),
      this._yScale(0),
      this._xScale(d.date),
      this._yScale(d.y),
    ];
  }
}
