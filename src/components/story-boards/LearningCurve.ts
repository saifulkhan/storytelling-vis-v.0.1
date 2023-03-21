import * as d3 from "d3";
import { ScaleLinear } from "d3";
import { AnimationType } from "src/models/AnimationType";

export type LearningCurveData = {
  index: number;
  date: Date;
  y: number; // accuracy
  x: number; // selected parameter
};

const WIDTH = 700;
let HEIGHT = 0;
const MARGIN1 = { top: 20, right: 20, bottom: 0, left: 50, height: 150 },
  MARGIN2 = { top: 0, right: 20, bottom: 30, left: 50, height: 100 },
  GAP = 80;

MARGIN1.bottom = MARGIN2.height - MARGIN1.top + GAP;
MARGIN2.top = MARGIN1.height - MARGIN2.bottom + GAP;
HEIGHT = MARGIN1.top + MARGIN1.bottom + MARGIN2.top + MARGIN2.bottom - GAP;

const YAXIS_LABEL_OFFSET = -35,
  X_LABEL_OFFSET = 25,
  TITLE_Y_POS = 15,
  DOT_RADIUS = 3;

const FONT_SIZE = "12px",
  TITLE_FONT_SIZE = "13px";

// Filter data that is within the brush selection
const filterByYValue = (
  data: LearningCurveData[],
  minY: number,
  maxY: number,
) => data.filter((d) => d.y >= minY && d.y <= maxY);

// Return  [[x1, y1], [x2, y2], ... ],
// where x1, x2, ... are unique and y1, y2, ... are max
const toXYPoints = (data: LearningCurveData[]) => {
  // For all unique values of x, keep the data point with the maximum y value
  const result = [];
  data.forEach((d, idx) => {
    const existing = result.find((el) => el.x === d.x);
    if (existing) {
      existing.y = Math.max(existing.y, d.y);
    } else {
      result.push(d);
    }
  });

  return result.map((d) => [d.x, d.y]);
};

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
  _currentPoint: LearningCurveData; // latest data point
  _maxPoint: LearningCurveData; // max data point
  _focusedData: LearningCurveData[]; // filtered data to show in focus chart

  _title = "[title]";
  _xLabel = "[x label]";
  _yLabel = "[y label]";
  _ticks = false;

  _lineColor = "#909090";
  _bandColor = "#DCDCDC";
  _lineStroke = 1.5;
  _dotColor = "#404040";
  _dotHighlightColor = "#E84A5F";
  _highlightCurrent: string;
  _highlightMax: string;

  x1Scale: ScaleLinear<number, number>;
  y1Scale: ScaleLinear<number, number>;
  y2Scale: ScaleLinear<number, number>;
  x2Scale: ScaleLinear<number, number>;
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

    this.x1Scale = d3.scaleLinear().nice().range([0, this.width1]);
    this.y1Scale = d3.scaleLinear().nice().range([this.height1, 0]);
    this.x2Scale = d3.scaleLinear().nice().range([0, this.width2]);
    this.y2Scale = d3.scaleLinear().nice().range([this.height2, 0]);

    this.xAxis1 = d3.axisBottom(this.x1Scale);
    this.yAxis1 = d3.axisLeft(this.y1Scale);
    this.xAxis2 = d3.axisBottom(this.x2Scale);
    this.yAxis2 = d3.axisLeft(this.y2Scale);

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

    //
    // Initialize brush
    //
    this.brush = d3
      .brushY()
      // start at [0, 0] and finishes at [width, height] of context/y2
      .extent([
        [0, 0],
        [this.width2, this.height2],
      ])
      // .on("end", brushed); // Generate one event at the end. This is useful while debugging
      .on("brush end", brushed); // Generate events while brushing. Looks good while using.

    //
    // Brush event handler
    //
    const that = this;
    function brushed() {
      console.log("LearningCurve: brushed: ...");
      const s =
        d3.event.selection || d3.brushSelection(this) || that.y2Scale.range();
      const domain = s.map((d) => that.y2Scale.invert(d));
      // Change domain of focus Y-axis
      const minY: number = d3.min(domain);
      const maxY: number = d3.max(domain);
      that.y1Scale.domain([minY, maxY]);
      // Filter data that is within the brush selection
      that._focusedData = filterByYValue(that._data, minY, maxY);
      // Draw axis, line, dots
      that.drawFocusAxes();
      that.drawLine("focus");
      that.drawDots("focus");

      // TODO: fix animation
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

    this.x1Scale.domain([min, max]);
    this.x2Scale.domain([min, max]);
    // Set context y between 0 and 1
    this.y2Scale.domain([0, 1]).nice();
    // Set focus y between min and max now. Later it will be set by brushing event.
    this.y1Scale.domain([
      d3.min(this._data, (d) => d.y),
      d3.max(this._data, (d) => d.y),
    ]);

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

  currentPoint(current: LearningCurveData, highlightCurrent: string) {
    this._currentPoint = current;
    this._highlightCurrent = highlightCurrent;
    return this;
  }

  maxPoint(maxPoint: LearningCurveData, highlightMax: string) {
    this._maxPoint = maxPoint;
    this._highlightMax = highlightMax;
    return this;
  }

  /**************************************************************************************************************
   * Drawing methods
   * Draw the context part of the visualization.
   * Focus part is drawn in the brush event handler.
   **************************************************************************************************************/

  plot() {
    console.log("LearningCurve: plot:");
    this.drawContextAxes();
    this.drawLine("context");
    this.drawDots("context");
    this.drawTitle();
    // We are not drawing area band now.
    // this.drawMinMaxBand();

    return this;
  }

  private drawFocusAxes() {
    console.log(`LearningCurve: drawFocusAxis:`);
    this.focus.selectAll("g").remove();

    // Draw the x-axis of the focus chart
    this.focus
      .append("g")
      .attr("transform", `translate(0, ${this.height1})`)
      .call(this.xAxis1)
      .style("font-size", FONT_SIZE);

    // Draw the y-axis / y1-axis of the focus chart
    this.focus
      .append("g")
      .call(this.yAxis1)
      .style("font-size", FONT_SIZE)
      // Y-axis label
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -this.height1 / 2)
      .attr("y", YAXIS_LABEL_OFFSET)
      .attr("class", "y label")
      .attr("text-anchor", "middle")
      .text(this._yLabel?.toLowerCase())
      .style("fill", "currentColor");
  }

  private drawContextAxes() {
    console.log(`LearningCurve: drawContextAxis:`);
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
    const brush = this.context
      .append("g")
      .attr("class", "brush")
      .call(this.brush);

    // Select min and max data points and draw brush around them
    brush
      .call(this.brush.move, () =>
        [d3.min(this._data, (d) => d.y), d3.max(this._data, (d) => d.y)].map(
          this.y2Scale,
        ),
      )
      .style("fill", "#D3D3D3")
      .style("opacity", 0.2);

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

  private drawLine(type: "focus" | "context") {
    console.log("LearningCurve: drawLine: type = ", type);
    let selection, data, xScale, yScale;

    if (type === "focus") {
      selection = this.focus;
      data = toXYPoints(this._focusedData);
      xScale = this.x1Scale;
      yScale = this.y1Scale;
    } else if (type === "context") {
      selection = this.context;
      data = toXYPoints(this._data);
      xScale = this.x2Scale;
      yScale = this.y2Scale;
    }

    const line = d3
      .line()
      .x((d) => {
        return xScale(d[0]);
      })
      .y((d) => {
        return yScale(d[1]);
      });

    selection
      .append("g")
      .append("path")
      .attr("stroke", this._lineColor)
      .attr("stroke-width", this.lineStroke)
      .attr("fill", "none")
      .attr("d", line(data));
  }

  private drawDots(type: "focus" | "context") {
    let selection, data, xScale, yScale;

    if (type === "focus") {
      selection = this.focus;
      data = this._focusedData;
      xScale = this.x1Scale;
      yScale = this.y1Scale;
    } else if (type === "context") {
      selection = this.context;
      data = this._data;
      xScale = this.x2Scale;
      yScale = this.y2Scale;
    }

    selection
      .append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      // .attr("id", (d) => `id-${type}-dots-${d?.index}`) // used with animation
      .attr("r", (d) =>
        this._maxPoint.index === d.index ? DOT_RADIUS * 2 : DOT_RADIUS,
      )
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .style("fill", (d) =>
        this._maxPoint.index === d.index ? this._highlightMax : this._dotColor,
      )
      .style("opacity", (d) => (this._maxPoint.index === d.index ? 1 : 0.4));

    selection
      .append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      // .attr("id", (d) => `id-${type}-dots-${d?.index}`) // used with animation
      .attr("r", (d) =>
        this._currentPoint.index === d.index ? DOT_RADIUS * 3 : 0,
      )
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .style("stroke", (d) =>
        this._currentPoint.index === d.index ? this._highlightCurrent : "none",
      )
      .style("fill", "none")
      .style("stroke-width", (d) =>
        this._currentPoint.index === d.index ? "1.5px" : "none",
      );
  }
  //
  // TODO: This has to be fixed if used later.
  //
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
   * Clear all elements inside svg.
   */
  private clear() {
    d3.select(this.svg).selectAll("svg > *").remove();
  }

  /**************************************************************************************************************
   * Animations
   **************************************************************************************************************/
  // TODO: fix animation

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
