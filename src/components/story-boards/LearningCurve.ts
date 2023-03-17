import * as d3 from "d3";
import { ScaleLinear } from "d3";
import { AnimationType } from "src/models/AnimationType";

export type LearningCurveData = {
  index: number;
  date: Date;
  y: number[]; // accuracy
  x: number; // parameter
};

const WIDTH = 800;
let HEIGHT = 0;
const MARGIN1 = { top: 20, right: 20, bottom: 0, left: 40, height: 200 },
  MARGIN2 = { top: 0, right: 20, bottom: 30, left: 40, height: 200 },
  GAP = 80;

MARGIN1.bottom = MARGIN2.height - MARGIN1.top + GAP;
MARGIN2.top = MARGIN1.height - MARGIN2.bottom + GAP;
HEIGHT = MARGIN1.top + MARGIN1.bottom + MARGIN2.top + MARGIN2.bottom - GAP;

const YAXIS_LABEL_OFFSET = -32,
  X_LABEL_OFFSET = 25,
  TITLE_Y_POS = 15,
  DOT_RADIUS = 3;

const FONT_SIZE = "12px",
  TITLE_FONT_SIZE = "13px";

const average = (list) =>
  list.reduce((prev, curr) => prev + curr) / list.length;

export class LearningCurve {
  selector: string;
  svg: any;
  focus: any;
  context: any;

  width: number;
  height: number;
  width1: number;
  width2: number;
  height1: number;
  height2: number;
  margin1: { top: number; right: number; bottom: number; left: number };
  margin2: { top: number; right: number; bottom: number; left: number };

  _data: LearningCurveData[];

  _title = "[title]";
  _xLabel = "[x label]";
  _yLabel = "[y label]";
  _ticks = false;

  _lineColor = "#909090";
  _bandColor = "#DCDCDC";
  _lineStroke = 1.5;
  _dotColor = "#404040";
  _dotHighlightColor = "#E84A5F";

  x1: ScaleLinear<number, number>;
  y1: ScaleLinear<number, number>;
  y2: ScaleLinear<number, number>;
  x2: ScaleLinear<number, number>;
  xAxis1: any;
  xAxis2: any;
  yAxis1: any;
  yAxis2: any;

  brush;

  animationCounter = 0;

  constructor(
    selector,
    height = HEIGHT,
    width = WIDTH,
    margin1 = MARGIN1,
    margin2 = MARGIN2,
  ) {
    this.selector = selector;
    this.height = height;
    this.width = width;
    this.margin1 = margin1;
    this.margin2 = margin2;

    d3.select(this.selector).select("svg").remove();
    this.svg = d3
      .select(this.selector)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);
    // .style("background-color", "pink"); // debug

    // prettier-ignore
    console.log("LearningCurveData: constructor: ", this.height, this.width, this.margin1, this.margin2);
    //  prettier-ignore
    this.width1 = this.width - this.margin1.left - this.margin1.right;
    this.width2 = this.width1;
    //  prettier-ignore
    this.height1 = this.height - this.margin1.top - this.margin1.bottom;
    //  prettier-ignore
    this.height2 = this.height - this.margin2.top - this.margin2.bottom;
    // prettier-ignore
    console.log("LearningCurveData: constructor: ", this.height, this.width, this.margin1, this.margin2);

    this.x1 = d3.scaleLinear().nice().range([0, this.width1]);
    this.y1 = d3.scaleLinear().nice().range([this.height1, 0]);
    this.x2 = d3.scaleLinear().nice().range([0, this.width2]);
    this.y2 = d3.scaleLinear().nice().range([this.height2, 0]);

    this.xAxis1 = d3.axisBottom(this.x1);
    this.yAxis1 = d3.axisLeft(this.y1);
    this.xAxis2 = d3.axisBottom(this.x2);
    this.yAxis2 = d3.axisLeft(this.y2);

    this.focus = this.svg
      .append("g")
      // .attr("class", "focus")
      .attr("id", "id-focus")
      .attr(
        "transform",
        `translate(${this.margin1.left}, ${this.margin1.top})`,
      );

    this.context = this.svg
      .append("g")
      // .attr("class", "context")
      .attr("id", "id-context")
      .attr(
        "transform",
        `translate(${this.margin2.left}, ${this.margin2.top})`,
      );

    this.brush = d3
      .brushY()
      // start at [0, 0] and finishes at [width, height]
      .extent([
        [0, 0],
        [this.width2, this.height2],
      ])
      // .on("end", brushed); // Generate one event at the end. This is useful while debugging
      .on("brush end", brushed); // Generate events while brushing. Looks good while using.

    //
    // Initialize brush
    //
    const that = this;
    function brushed() {
      const s =
        d3.event.selection || d3.brushSelection(this) || that.y2.range();
      const domain = s.map((d) => that.y2.invert(d));
      // Change domain of focus Y-axis
      const minY: number = d3.min(domain);
      const maxY: number = d3.max(domain);
      that.y1.domain([minY, maxY]);

      // filter data that is within the brush selection
      const filteredData: LearningCurveData[] = [];
      that._data.forEach((d) => {
        const arr = d.y.filter((x) => x >= minY && x <= maxY);
        if (arr.length > 0) {
          filteredData.push({ ...d, y: arr });
        }
      });

      LearningCurve.drawFocusAxes(
        that.focus,
        that.height1,
        that.xAxis1,
        that.yAxis1,
        that.width1,
        that._xLabel,
        that._yLabel,
      );

      LearningCurve.drawLine(
        that.focus,
        filteredData,
        that.x1,
        that.y1,
        that._lineColor,
        that.lineStroke,
      );

      LearningCurve.drawDots(
        that.focus,
        filteredData,
        that.x1,
        that.y1,
        that._dotColor,
        "focus",
      );

      if (that.animationCounter > 0) {
        LearningCurve.animateDotColor(
          that.svg,
          "focus",
          that.animationCounter - 1,
          that._dotHighlightColor,
          DOT_RADIUS * 2,
        );
      }
    }

    return this;
  }

  /**************************************************************************************************************
   * Setters
   **************************************************************************************************************/

  data(data: LearningCurveData[]) {
    this._data = data;

    // Extend the domain by 1% on both sides
    let [min, max] = d3.extent(this._data, (d) => d.x);
    min -= (max - min) * 0.01;
    max += (max - min) * 0.01;

    this.x1.domain([min, max]);
    this.x2.domain([min, max]);
    this.y2.domain([0, d3.max(this._data, (d) => d3.max(d.y))]).nice();
    this.y1.domain([0, d3.max(this._data, (d) => d3.max(d.y))]); // to be set by brushing event

    return this;
  }

  title(title) {
    this._title = title;
    return this;
  }

  xLabel(xLabel) {
    this._xLabel = xLabel;
    return this;
  }

  yLabel(yLabel) {
    this._yLabel = yLabel;
    return this;
  }

  lineColor(lineColor) {
    this._lineColor = lineColor;
    return this;
  }

  lineStroke(line1Stroke: number) {
    this._lineStroke = line1Stroke;
    return this;
  }

  ticks(ticks) {
    this._ticks = ticks;
    this.xAxis1.ticks(this._ticks);
    this.xAxis2.ticks(this._ticks);

    return this;
  }

  dotColor(dotColor) {
    this._dotColor = dotColor;
    return this;
  }

  dotHighlightColor(dotHighlightColor) {
    this._dotHighlightColor = dotHighlightColor;
    return this;
  }

  /**************************************************************************************************************
   * Drawing context part of the visualization
   **************************************************************************************************************/

  plot() {
    console.log("LearningCurve: plot:");
    this.drawContextAxes();

    LearningCurve.drawFocusAxes(
      this.focus,
      this.height1,
      this.xAxis1,
      this.yAxis1,
      this.width1,
      this._xLabel,
      this._yLabel,
    );

    LearningCurve.drawLine(
      this.context,
      this._data,
      this.x2,
      this.y2,
      this._lineColor,
      this.lineStroke,
    );
    LearningCurve.drawDots(
      this.context,
      this._data,
      this.x2,
      this.y2,
      this._dotColor,
      "context",
    );

    this.drawTitle();

    this.drawMinMaxBand();

    return this;
  }

  /**
   * Create axes and add labels
   */
  private drawContextAxes() {
    console.log(`LearningCurve: _drawContextAxis():`);

    // clear
    this.context.selectAll("g").remove();

    // X-axis
    this.context
      .append("g")
      .attr("transform", `translate(0, ${this.height2})`)
      .call(this.xAxis2)
      .style("font-size", FONT_SIZE)
      // X-axis label
      .append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", this.width2 / 2)
      .attr("y", X_LABEL_OFFSET)
      .text(this._xLabel)
      .style("fill", "currentColor");

    // Y-axis
    this.context
      .append("g")
      // .attr("transform", `translate(${this.margin2.left}, 0)`)
      .call(this.yAxis2)
      .style("font-size", FONT_SIZE)
      // Y-axis label
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -this.height2 / 2)
      .attr("y", YAXIS_LABEL_OFFSET)
      .attr("class", "y label")
      .attr("text-anchor", "middle")
      .text(this._yLabel?.toLowerCase())
      .style("fill", "currentColor");

    // Add brush
    this.context.append("g").attr("class", "brush").call(this.brush);

    return this;
  }

  private drawTitle() {
    this.svg
      .append("text")
      .style("font-size", TITLE_FONT_SIZE)
      .attr("x", this.width / 2)
      .attr("y", TITLE_Y_POS)
      .attr("text-anchor", "middle")
      .text(this._title)
      .attr("font-weight", "bold")
      .style("fill", "#696969");
  }

  private drawMinMaxBand() {
    const area = d3
      .area()
      .curve(d3.curveMonotoneX)
      .x((d) => d.x)
      .y0((d) => Math.max(d.y))
      .y1((d) => Math.min(d.y));

    this.context
      .append("path")
      .attr("fill", "#1f77b4")
      .attr("stroke", "none")
      .attr("opacity", 0.3)
      .attr("d", area(this._data));
  }

  /**
   * Select all elements below svg with the selector "svg > *" and remove.
   */
  private clear() {
    d3.select(this.svg).selectAll("svg > *").remove();
  }

  /**************************************************************************************************************
   * Static methods - Mainly because of the brush "this" issue
   **************************************************************************************************************/

  private static drawFocusAxes(
    selection,
    height1,
    xAxis1,
    yAxis1,
    width1,
    xLabel,
    yLabel,
  ) {
    selection.selectAll("g").remove();

    // X-axis
    selection
      .append("g")
      .attr("transform", `translate(0, ${height1})`)
      .call(xAxis1)
      .style("font-size", FONT_SIZE);
    // X-axis label
    // .append("text")
    // .attr("class", "x-label")
    // .attr("text-anchor", "middle")
    // .attr("x", width1 / 2)
    // .attr("y", X_LABEL_OFFSET)
    // .text(xLabel)
    // .style("fill", "currentColor");

    // Y-Axis
    selection.append("g").call(yAxis1).style("font-size", FONT_SIZE);
    // Y-axis label
    // .append("text")
    // .attr("transform", "rotate(-90)")
    // .attr("x", -height1 / 2)
    // .attr("y", YAXIS_LABEL_OFFSET)
    // .attr("class", "y label")
    // .attr("text-anchor", "middle")
    // .text(yLabel?.toLowerCase())
    // .style("fill", "currentColor");
  }

  private static drawDots(
    selection,
    data,
    xScale,
    yScale,
    color,
    type: "focus" | "context",
  ) {
    selection
      .append("g")
      .attr("id", (d) => `id-${type}-dots`)
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("id", (d) => `id-${type}-dots-${d?.index}`)
      .selectAll("circle")
      .data((d) => d?.y)
      .enter()
      .append("circle")
      .attr("r", DOT_RADIUS)
      .attr("cx", function (d) {
        const parent = d3.select(this.parentNode).datum();
        return xScale(parent?.x);
      })
      .attr("cy", (d) => yScale(d))
      .style("fill", color)
      .style("opacity", function (d) {
        const parent = d3.select(this.parentNode).datum();
        return parent?.y.length > 1 ? 0.5 : 1;
      });
  }

  private static drawLine(selection, data, xScale, yScale, color, stroke) {
    const line = d3
      .line()
      .x((d) => {
        return xScale(d.x);
      })
      .y((d) => {
        return yScale(average(d.y));
      });

    selection
      .append("g")
      .append("path")
      .attr("stroke", color)
      .attr("stroke-width", stroke)
      .attr("fill", "none")
      .attr("d", line(data));
  }

  /**************************************************************************************************************
   * Animations
   **************************************************************************************************************/

  animate(animationType: AnimationType) {
    console.log("TimeSeries: animate: animationType = ", animationType);

    if (animationType === "back" && this.animationCounter >= 0) {
      // this._animateBack();
      this.animationCounter -= 1;
    } else if (animationType === "beginning") {
      // this.animateBeginning();
      this.animationCounter = -1;
    } else if (
      animationType === "play" &&
      this.animationCounter + 1 <= this._data.length
    ) {
      this.animateForward();
      this.animationCounter += 1;
    }

    // prettier-ignore
    console.log("LearningCurve: animate: animationCounter: ", this.animationCounter)
  }

  private animateForward() {
    // prettier-ignore
    console.log("LearningCurve: animateForward: animationCounter: ", this.animationCounter)

    // Highlight
    LearningCurve.animateDotColor(
      this.svg,
      "focus",
      this.animationCounter,
      this._dotHighlightColor,
      DOT_RADIUS * 2,
    );
    LearningCurve.animateDotColor(
      this.svg,
      "context",
      this.animationCounter,
      this._dotHighlightColor,
      DOT_RADIUS * 2,
    );

    // Change back
    LearningCurve.animateDotColor(
      this.svg,
      "focus",
      this.animationCounter - 1,
      this._dotColor,
    );
    LearningCurve.animateDotColor(
      this.svg,
      "context",
      this.animationCounter - 1,
      this._dotColor,
    );
  }

  private static animateDotColor(
    selection,
    type: "context" | "focus",
    counter: number,
    color: string,
    radius: number = DOT_RADIUS,
  ) {
    selection
      .select(`#id-${type}`) // returns group
      .select(`#id-${type}-dots`) // returns group
      .select(`#id-${type}-dots-${counter}`) // returns group
      .selectAll("circle")
      .transition()
      .ease(d3.easeLinear)
      .delay(0)
      .duration(1000)
      .attr("r", radius)
      .style("fill", color);
  }
}
