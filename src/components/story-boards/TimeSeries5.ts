import * as d3 from "d3";
import { ITimeSeriesData } from "src/models/ITimeSeriesData";
import { GraphAnnotation } from "./GraphAnnotation";

const WIDTH = 1200,
  HEIGHT = 400,
  MARGIN = 50;

const xScale = (data: ITimeSeriesData[], w = WIDTH, m = MARGIN) => {
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d: ITimeSeriesData) => d.date))
    .nice()
    .range([m, w - m]);
  return xScale;
};

const yScale = (data: ITimeSeriesData[], h = HEIGHT, m = MARGIN) => {
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d: ITimeSeriesData) => d.y))
    .range([h - m, m]);
  return yScale;
};

export class TimeSeries {
  _data1: ITimeSeriesData[];
  _data2;
  _svg: SVGSVGElement;
  _title = "";
  _xLabel = "";
  _yLabel1 = "";
  _yLabel2 = "";
  _color = "Black";
  _color2: string;
  _width: number;
  _height: number;
  _margin = MARGIN;
  _ticks = false;
  _showPoints = false;
  _showEventLines = true;
  _xScale: any;
  _yScale1: any;
  _yScale2: any;
  _annotations;
  _annoTop = false;
  _animationCounter;

  _selector: string;
  _isSameScale = false;

  _pathElements = [];
  _annotationElements = [];

  constructor(width = WIDTH, height = HEIGHT) {
    this._width = width;
    this._height = height;
    this._margin = MARGIN;
  }

  /**
   * 1. Add data
   */
  data(data1: ITimeSeriesData[], data2 = null, isSameScale = true) {
    this._data1 = data1;
    this._data2 = data2;
    this._isSameScale = isSameScale;

    return this;
  }

  /**
   * 2 (a)
   * The svg canvas is not created here, when we intend to draw on top of another svg, set by svg()
   * e.g., story 3
   */
  selector(selector) {
    this._selector = selector;
    d3.select(this._selector).select("svg").remove();

    this._svg = d3
      .select(this._selector)
      .append("svg")
      .attr("width", this._width)
      .attr("height", this._height)
      .node();

    this.width(this._width);
    this.height(this._height);
    // TODO check // this._drawAxisAndLabels();

    return this;
  }

  /**
   * 2 (b)
   * The svg canvas is not created here, when we intend to draw on top of another svg, set by svg()
   * Used in story 3, where scrolling svg is passed
   */
  svg(svg) {
    this._svg = svg;
    d3.select(this._selector).select("svg").remove();

    const bounds = svg.getBoundingClientRect();
    this.width(bounds.width);
    this.height(bounds.height);
    // TODO check // this._drawAxisAndLabels();

    return this;
  }

  // addExtraDatasets(dataGroup, isSameScale = true) {
  //   this._isSameScale = isSameScale;
  //   this._data2 = dataGroup;
  //   this._fitPairedData();
  //   return this;
  // }

  // { end: number; start: number; annotation: GraphAnnotation }[]
  annotations(annotations) {
    console.log("TimeSeries1: annotations: 1 annotations: ", annotations);

    annotations.forEach((d: any) => {
      const annoObj: GraphAnnotation = d.annotation;

      console.log("TimeSeries1: annotations: annoObj:", annoObj);

      if (annoObj) {
        annoObj.x(this._xScale(annoObj.unscaledTarget[0]));
        annoObj.y(this._height / 2);

        annoObj.target(
          this._xScale(annoObj.unscaledTarget[0]),
          this._yScale1(annoObj.unscaledTarget[1]),
          true,
          { left: annoObj.left, right: !annoObj.left }, // TODO: fix this
        );
      }

      console.log("TimeSeries1: annotations: annoObj:", annoObj);
    });

    this._annotations = annotations;
    console.log("TimeSeries1: annotations: 2 annotations: ", annotations);

    // TODO This can be done once
    // Convert data to array of coordinate pairs i.e. [[x1, y1],[x2, y2]...[xn, yn]]
    const points1 = this._data1.map(Object.values);
    let points2;

    // console.log("_data1", this._data1);
    // console.log("points1", points1);

    if (this._data2) {
      const colors = this._data2.colors; // TODO: add setColor2
      this._data2.group.forEach((data, i) => {
        points2 = data.map(Object.values);
      });
    }

    // Create a list of d3 paths and annotations from our animation list
    this._createPaths(points1, points2);
    this._createAnnos();

    console.log("paths", this._pathElements);
    console.log("annotations", this._annotationElements);

    return this;
  }

  annoTop() {
    this._annoTop = true;
    return this;
  }

  plot() {
    console.log("TimeSeries1: plot:");
    this._clearSvg();
    this._drawAxisAndLabels();

    const points1 = this._data1.map(Object.values);
    // When we dont want to animate- simply add a single static path derived from the datapoints.
    // if (!this._annotations) {
    const line1 = d3
      .line()
      .x((d) => this._xScale(d[0]))
      .y((d) => this._yScale1(d[1]));

    d3.select(this._svg)
      .append("path")
      .attr("stroke", this._color)
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .attr("d", line1(points1));
    // }

    if (this._data2) {
      const colors = this._data2.colors; // TODO: add setColor2
      this._data2.group.forEach((data, i) => {
        let points2 = data.map(Object.values);
        // if (!this._annotations) {
        d3.select(this._svg)
          .append("path")
          .attr("stroke", colors ? colors[i % colors.length] : this._color)
          .attr("stroke-width", 3)
          .attr("fill", "none")
          .attr(
            "d",
            d3
              .line()
              .x((d) => this._xScale(d[0]))
              .y((d) => this._yScale2(d[1]))(points2),
          );
        // }
      });
    }

    // Add static annotations
    // TODO fix this
    // if (this._annotations) {
    //   this._annotations.forEach((anno, idx) =>
    //     anno.id("anno-" + idx).addTo(this._svg),
    //   );
    //   if (this._showEventLines) {
    //     const container = d3.select(this._svg);
    //     this._annotations.forEach((anno) =>
    //       this._addEventLine(container, anno._tx, anno._ty),
    //     );
    //   }
    // }

    return this._svg;
  }

  animate(animationCounter) {
    console.log("TimeSeries1: animate: animationCounter: ", animationCounter);

    this._animationCounter = animationCounter;

    // return this;

    this._drawAxisAndLabels();
    // show line paths
    this._showPaths();
  }

  /**************************************************************************************************************
   * Private methods
   **************************************************************************************************************/

  /*
   * Helper for plot()
   * This will create and add paths to svg based on whether the ts has been called with animate
   */
  _showPaths() {
    // if (!this._annotations) return;
    // console.log("TimeSeries1: _showPaths:");

    // // TODO This can be done once
    // // Convert data to array of coordinate pairs i.e. [[x1, y1],[x2, y2]...[xn, yn]]
    // const points1 = this._data1.map(Object.values);
    // let points2;

    // // console.log("_data1", this._data1);
    // // console.log("points1", points1);

    // if (this._data2) {
    //   const colors = this._data2.colors; // TODO: add setColor2
    //   this._data2.group.forEach((data, i) => {
    //     points2 = data.map(Object.values);
    //   });
    // }

    // // Create a list of d3 paths and annotations from our animation list
    // this._createPaths(points1, points2);
    // this._createAnnos();

    console.log("_pathElements", this._pathElements);
    console.log("_annotationElements", this._annotationElements);

    // We want to animate and are given a list of path segments and annotations to animate
    const pathNum = this._annotations.length; // Number of path segments

    // Use modulus to repeat animation sequence once counter > number of animation segments
    const idx = this._animationCounter % pathNum;
    const prevIdx = (this._animationCounter - 1) % pathNum;

    // Get path and annotations for current animation and previous one
    const currPath = this._pathElements[idx];
    const duration = currPath.duration || 1000;
    const currAnno = this._annotationElements[idx];
    const prevAnno = this._annotationElements[prevIdx];

    // prettier-ignore
    console.log(pathNum, prevIdx, idx, currPath, duration, currAnno, prevAnno);

    // If we have a previous annotation that needs to be faded out do so
    if (prevAnno && prevAnno.fadeout && prevIdx != pathNum - 1) {
      prevAnno.anno
        .style("opacity", 1)
        .transition()
        .duration(500)
        .style("opacity", 0);
    }

    // If we have faded out we need to delay the following animations (value is 1000 if true)
    const fadeOutDelay = (prevAnno && prevAnno.fadeout && 500) + 500;

    // Animate current path with duration given by user
    currPath.path
      .transition()
      .ease(d3.easeLinear)
      .delay(fadeOutDelay)
      .duration(duration)
      .attr("stroke-dashoffset", 0);

    // Animate the fadein of annotation after the path has fully revealed itself
    if (currAnno) {
      currAnno.anno
        .transition()
        .delay(duration + fadeOutDelay)
        .duration(500)
        .style("opacity", 1);
    }

    // Set the paths before current path to be visible (default to invisible at each step)
    this._pathElements
      .slice(0, idx)
      .forEach((p) => p.path.attr("stroke-dashoffset", 0));

    // Set the persisting annotations to be visible (default to invisible at each step)
    this._annotationElements.slice(0, idx).forEach((a) => {
      if (a && !a.fadeout) {
        a.anno.style("opacity", 1);
      }
    });
  }

  /*
   * Returns array of objects representing (for each annotation) segment path, their length and animation duration
   */
  _createPaths(points1, points2) {
    let subPoints, path, length, duration;

    console.log("TimeSeries1: _createPaths: annotations: ", this._annotations);

    // d3.select(this._svg).selectAll("#id-line-chart").remove();
    // const selection = d3
    //   .select(this._svg)
    //   .append("g")
    //   .attr("id", "axis-labels");

    this._pathElements = this._annotations.map((obj) => {
      // Slice datapoints within the start and end idx of the segment
      if (obj.useData2) {
        subPoints = points2.slice(obj.start, obj.end + 1);
      } else {
        subPoints = points1.slice(obj.start, obj.end + 1);
      }

      // Clear any exisitng path, and create a d3 path with this data slice

      path = d3
        .select(this._svg)
        .append("path")
        .attr("stroke", obj.color || "black")
        .attr("stroke-width", 3)
        .attr("fill", "none")
        .attr(
          "d",
          d3
            .line()
            .x((d) => this._xScale(d[0]))
            .y((d) =>
              obj.useData2 ? this._yScale2(d[1]) : this._yScale1(d[1]),
            )(subPoints),
        );
      length = path.node().getTotalLength();
      // Set the path to be hidden initially
      path
        .attr("stroke-dasharray", length + " " + length)
        .attr("stroke-dashoffset", length);

      duration = obj.duration || length * 4;
      // return path and length as an object
      return { path: path, length: length, duration: duration };
    });

    //console.log(this._annotations.map(createPath));

    // return this._annotations.map(createPath);
    // prettier-ignore
    console.log("TimeSeries1: _createPaths: _pathElements: ", this._pathElements);
  }

  /**
   *  Returns an array of objects representing annotation type and persistence
   */
  _createAnnos() {
    // Helper for _addPaths fnc
    let anno, annoObj, annoElem;

    // const createAnno = (animObj, idx) => {

    this._annotationElements = this._annotations.map((obj, idx) => {
      // Try to get the graphAnnotation object if undefined set array elem to false
      annoObj = obj.annotation;
      if (!obj.annotation) return false;

      // If annotation obj defined - add to svg and set opacity to 0 (hide it)
      anno = annoObj.id(`anim-anno-${idx}`);
      anno.addTo(this._svg);

      if (this._annoTop) {
        anno.y(this._margin + anno._annoHeight / 2);
        anno.updatePos(anno._x, anno._y);
      }

      annoElem = d3.select(`#anim-anno-${idx}`).style("opacity", 0);

      if (this._showEventLines) {
        const container = d3.select(`#anim-anno-${idx}`);
        this._addEventLine(container, anno._tx, anno._ty);
      }

      // return d3 selection of anno element and boolean indication whether to persist annotation
      return {
        anno: annoElem,
        fadeout: obj.fadeout || false,
      };
    });

    // return this._annotations.map(createAnno);
    // prettier-ignore
    console.log("TimeSeries1: _createAnnos: _annotationElements: ", this._annotationElements);
  }

  _addEventLine(container, x, y) {
    container
      .append("line")
      .attr("x1", x)
      .attr("y1", y)
      .attr("x2", x)
      .attr("y2", this._height - this._margin)
      .attr("stroke-dasharray", 5)
      .style("stroke-width", 1)
      .style("stroke", "#999")
      .style("fill", "none");
  }

  /**
   * TODO: debug & test second data group
   */
  _fitPairedData() {
    let data2Comb = this._data2.group.reduce((comb, arr) => comb.concat(arr));
    let combData = this._data1.concat(data2Comb);

    this._xScale = xScale(combData, this._width, this._margin);

    if (this._data2.domain) {
      data2Comb = this._data2.domain.map((v) => {
        return { y: v };
      });
      combData = this._data1.concat(data2Comb);
    }

    if (!this._isSameScale) {
      this._yScale1 = yScale(this._data1, this._height, this._margin);
      this._yScale2 = yScale(data2Comb, this._height, this._margin);
    } else {
      this._yScale1 = this._yScale2 = yScale(
        combData,
        this._height,
        this._margin,
      );
    }
  }

  /*
   * Create axes and add labels
   */
  _drawAxisAndLabels() {
    // Clear axes and labels
    d3.select(this._svg).selectAll("#id-axes-labels").remove();
    const selection = d3
      .select(this._svg)
      .append("g")
      .attr("id", "id-axes-labels");

    const axisBottom = d3.axisBottom(this._xScale);
    this._ticks && axisBottom.ticks(this._ticks);

    selection
      .append("g")
      .attr("transform", `translate(0, ${this._height - this._margin})`)
      .call(axisBottom);

    selection
      .append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", this._width / 2)
      .attr("y", this._height - 5)
      .text(this._xLabel);

    const axisLeft = d3.axisLeft(this._yScale1);
    selection
      .append("g")
      .attr("transform", `translate(${this._margin}, 0)`)
      .call(axisLeft);

    selection
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -this._height / 2)
      .attr("y", 15)
      .attr("class", "y label")
      .attr("text-anchor", "middle")
      .text(this._yLabel1);

    if (this._data2 && !this._isSameScale) {
      const axisRight = d3.axisRight(this._yScale2);
      selection
        .append("g")
        .attr("transform", `translate(${this._width - this._margin},0)`)
        .call(axisRight);

      selection
        .append("text")
        .attr("transform", "rotate(90)")
        .attr("x", this._height / 2)
        .attr("y", -this._width + 15)
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .text(this._yLabel2);
    }

    // Display Title
    selection
      .append("text")
      .style("font-size", "px")
      .attr("x", this._width / 2)
      .attr("y", this._margin / 2)
      .attr("text-anchor", "middle")
      .text(this._title)
      .attr("font-weight", "bold");

    if (this._showPoints) {
      selection
        .append("g")
        .selectAll("circle")
        .data(this._data1.map(Object.values))
        .join("circle")
        .attr("r", 3)
        .attr("cx", (d) => this._xScale(d[0]))
        .attr("cy", (d) => this._yScale1(d[1]))
        .style("fill", this._color);
    }

    return this;
  }

  /*
   * Select all elements below svg with the selector "svg > *" and remove.
   * Otherwise it will keep drawing on top of the previous lines / scales.
   */
  _clearSvg() {
    d3.select(this._svg).selectAll("svg > *").remove();
  }

  /**************************************************************************************************************
   * Setter & Getter functions
   **************************************************************************************************************/

  title(title) {
    this._title = title;
    return this;
  }

  xLabel(xLabel) {
    this._xLabel = xLabel;
    return this;
  }

  yLabel(yLabel) {
    this._yLabel1 = yLabel;
    return this;
  }

  yLabel2(yLabel) {
    this._yLabel2 = yLabel;
    return this;
  }

  color2(color) {
    this._color2 = color;
    return this;
  }

  color(color) {
    this._color = color;
    return this;
  }

  ticks(ticks) {
    this._ticks = ticks;
    return this;
  }

  height(height) {
    this._height = height;

    this._yScale1 = yScale(this._data1, this._height, this._margin);
    if (this._data2) this._fitPairedData();
    return this;
  }

  width(width) {
    this._width = width;

    // Same scale
    this._xScale = xScale(this._data1, this._width, this._margin);
    if (this._data2) this._fitPairedData();
    return this;
  }

  border(border) {
    this._margin = border;

    this._xScale = xScale(this._data1, this._width, this._margin);
    if (this._data2) this._fitPairedData();
    return this;
  }

  showPoints() {
    this._showPoints = true;
    return this;
  }

  showEventLines() {
    this._showEventLines = true;
    return this;
  }

  getXScale() {
    return this._xScale;
  }

  getYScale() {
    return this._yScale1;
  }

  getYScale2() {
    return this._yScale2;
  }
}
