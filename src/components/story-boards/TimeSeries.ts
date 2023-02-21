import * as d3 from "d3";
import { ITimeSeriesData } from "src/models/ITimeSeriesData";

const WIDTH = 1200,
  HEIGHT = 400,
  BOARDER = 50;

const xScale = (data: ITimeSeriesData[], w = WIDTH, b = BOARDER) => {
  const xExtent = d3.extent(data, (d: ITimeSeriesData) => d.date);
  const xScale = d3
    .scaleTime()
    .domain(xExtent)
    .range([b, w - b]);
  return xScale;
};

const yScale = (data: ITimeSeriesData[], h = HEIGHT, b = BOARDER) => {
  const yExtent = d3.extent(data, (d: ITimeSeriesData) => d.y);
  const yScale = d3
    .scaleLinear()
    .domain(yExtent)
    .range([h - b, b]);
  return yScale;
};

export class TimeSeries {
  _data1: ITimeSeriesData[];
  _data2: ITimeSeriesData[];
  _svg: SVGSVGElement;
  _title = "";
  _xLabel = "";
  _yLabel1 = "";
  _yLabel2 = "";
  _color = "Black";
  _color2: string;
  _width: number;
  _height: number;
  _border = BOARDER;
  _ticks = false;
  _showPoints = false;
  _showEventLines = false;
  _xScale: any;
  _yScale1: any;
  _yScale2: any;
  // _annotations;
  _annoTop = false;
  _annotations;
  _animationCounter;

  _selector: string;
  _isSameScale = false;

  constructor(
    data1: ITimeSeriesData[],
    selector = undefined,
    width = WIDTH,
    height = HEIGHT,
  ) {
    this._selector = selector;
    this._data1 = data1;
    this._width = width;
    this._height = height;
    this._border = BOARDER;
    this._xScale = xScale(this._data1, this._width, this._border);
    this._yScale1 = yScale(this._data1, this._height, this._border);
    this._yScale2;

    // Remove any exisitng svg, otherwise it will keep adding
    d3.select(selector).select("svg").remove();

    // The svg canvas is not created here, when we intend to draw on top of another svg, set by svg()
    // Example, story 4
    if (selector) {
      this._svg = d3
        .select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .node();
    }
  }

  addExtraDatasets(dataGroup, isSameScale = true) {
    this._isSameScale = isSameScale;
    this._data2 = dataGroup;
    this._fitPairedData();
    return this;
  }

  _fitPairedData() {
    let data2Comb = this._data2.group.reduce((comb, arr) => comb.concat(arr));
    let combData = this._data1.concat(data2Comb);

    this._xScale = xScale(combData, this._width, this._border);

    if (this._data2.domain) {
      data2Comb = this._data2.domain.map((v) => {
        return { y: v };
      });
      combData = this._data1.concat(data2Comb);
    }

    if (!this._isSameScale) {
      this._yScale1 = yScale(this._data1, this._height, this._border);
      this._yScale2 = yScale(data2Comb, this._height, this._border);
    } else {
      this._yScale1 = this._yScale2 = yScale(
        combData,
        this._height,
        this._border,
      );
    }
  }

  /*
   * Used in story 3, where scrolling svg is passed
   */
  svg(svg) {
    this._svg = svg;
    const bounds = svg.getBoundingClientRect();
    this.width(bounds.width);
    this.height(bounds.height);
    return this;
  }

  animate(annotations, animationCounter) {
    this._annotations = annotations;
    this._animationCounter = animationCounter;

    return this;
  }

  annoTop() {
    this._annoTop = true;
    return this;
  }

  _createPaths(points1, points2) {
    // Helper for _addPaths fnc
    // Returns array of objects representing segment path, their length and animation duration
    let subPoints, path, length, duration;
    const createPath = (animObj, i) => {
      // Slice datapoints within the start and end idx of the segment
      if (animObj.useData2) {
        subPoints = points2.slice(animObj.start, animObj.end + 1);
      } else {
        subPoints = points1.slice(animObj.start, animObj.end + 1);
      }

      // Create a d3 path with this data slice
      path = d3
        .select(this._svg)
        .append("path")
        .attr("stroke", animObj.color || "black")
        .attr("stroke-width", 3)
        .attr("fill", "none")
        .attr(
          "d",
          d3
            .line()
            .x((d) => this._xScale(d[0]))
            .y((d) =>
              animObj.useData2 ? this._yScale2(d[1]) : this._yScale1(d[1]),
            )(subPoints),
        );
      length = path.node().getTotalLength();
      // Set the path to be hidden initially
      path
        .attr("stroke-dasharray", length + " " + length)
        .attr("stroke-dashoffset", length);

      duration = animObj.duration || length * 4;
      // return path and length as an object
      return { path: path, length: length, duration: duration };
    };

    return this._annotations.map(createPath);
  }

  _addEventLine(container, x, y) {
    container
      .append("line")
      .attr("x1", x)
      .attr("y1", y)
      .attr("x2", x)
      .attr("y2", this._height - this._border)
      .attr("stroke-dasharray", 5)
      .style("stroke-width", 1)
      .style("stroke", "#999")
      .style("fill", "none");
  }

  _createAnnos() {
    // Helper for _addPaths fnc
    // Returns an array of objects representing annotation type and persistence
    let anno, annoObj, annoElem;
    const createAnno = (animObj, idx) => {
      // Try to get the graphAnnotation object if undefined set array elem to false
      annoObj = animObj.annotation;
      if (!animObj.annotation) return false;

      // If annotation obj defined - add to svg and set opacity to 0 (hide it)
      anno = annoObj.id(`anim-anno-${idx}`);
      anno.addTo(this._svg);

      if (this._annoTop) {
        anno.y(this._border + anno._annoHeight / 2);
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
        fadeout: animObj.fadeout || false,
      };
    };
    return this._annotations.map(createAnno);
  }

  /*
   * Helper for plot()
   * This will create and add paths to svg based on whether the ts has been called with animate
   */
  _addPaths() {
    // Convert data to array of coordinate pairs i.e. [[x1, y1],[x2, y2]...[xn, yn]]
    const points1 = this._data1.map(Object.values);
    let points2;

    // TODO: Need to update the data2 structure ITimeSeriesData[]
    // add setColor2 ?

    if (this._data2) {
      const colors = this._data2.colors; // TODO: add setColor2
      this._data2.group.forEach((data, i) => {
        // TODO: remove group
        points2 = data.map(Object.values);
        if (!this._annotations) {
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
        }
      });
    }

    if (!this._annotations) {
      // When we dont want to animate simply add a single static path derived from the datapoints
      d3.select(this._svg)
        .append("path")
        .attr("stroke", this._color)
        .attr("stroke-width", 3)
        .attr("fill", "none")
        .attr(
          "d",
          d3
            .line()
            .x((d) => this._xScale(d[0]))
            .y((d) => this._yScale1(d[1]))(points1),
        );
    } else {
      // We want to animate and are given a list of path segments and annotations to animate
      const pathNum = this._annotations.length; // Number of path segments

      // Create a list of d3 paths and annotations from our animation list
      const paths = this._createPaths(points1, points2);
      const annotations = this._createAnnos();

      // Use modulus to repeat animation sequence once counter > number of animation segments
      const idx = this._animationCounter % pathNum;
      const prevIdx = (this._animationCounter - 1) % pathNum;

      // Get path and annotations for current animation and previous one
      const currPath = paths[idx];
      const duration = currPath.duration || 1000;
      const currAnno = annotations[idx];
      const prevAnno = annotations[prevIdx];

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
      paths.slice(0, idx).forEach((p) => p.path.attr("stroke-dashoffset", 0));

      // Set the persisting annotations to be visible (default to invisible at each step)
      annotations.slice(0, idx).forEach((a) => {
        if (a && !a.fadeout) {
          a.anno.style("opacity", 1);
        }
      });
    }
  }

  plot() {
    // select all elements below svg with the selector "svg > *" and remove
    // otherwise it will keep drawing on top of the previous lines / scales
    d3.select(this._svg).selectAll("svg > *").remove();

    // Create line paths
    this._addPaths();

    // Add static annotations
    // SK: Not sure
    // if (this._annotations) {
    //   this._annotations.forEach((anno, idx) =>
    //     anno.id("anno-" + idx).addTo(this._ctx),
    //   );
    //   if (this._showEventLines) {
    //     const container = d3.select(this._ctx);
    //     this._annotations.forEach((anno) =>
    //       this._addEventLine(container, anno._tx, anno._ty),
    //     );
    //   }
    // }

    // Create Axes and add Labels
    const axisBottom = d3.axisBottom(this._xScale);
    if (this._ticks) {
      axisBottom.ticks(this._ticks);
    }
    d3.select(this._svg)
      .append("g")
      .attr("transform", `translate(0,${this._height - this._border})`)
      .call(axisBottom);

    d3.select(this._svg)
      .append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", this._width / 2)
      .attr("y", this._height - 5)
      .text(this._xLabel);

    const axisLeft = d3.axisLeft(this._yScale1);
    d3.select(this._svg)
      .append("g")
      .attr("transform", `translate(${this._border},0)`)
      .call(axisLeft);

    d3.select(this._svg)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -this._height / 2)
      .attr("y", 15)
      .attr("class", "y label")
      .attr("text-anchor", "middle")
      .text(this._yLabel1);

    if (this._data2 && !this._isSameScale) {
      const axisRight = d3.axisRight(this._yScale2);
      d3.select(this._svg)
        .append("g")
        .attr("transform", `translate(${this._width - this._border},0)`)
        .call(axisRight);

      d3.select(this._svg)
        .append("text")
        .attr("transform", "rotate(90)")
        .attr("x", this._height / 2)
        .attr("y", -this._width + 15)
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .text(this._yLabel2);
    }

    // Display Title
    d3.select(this._svg)
      .append("text")
      .style("font-size", "px")
      .attr("x", this._width / 2)
      .attr("y", this._border / 2)
      .attr("text-anchor", "middle")
      .text(this._title)
      .attr("font-weight", "bold");

    if (this._showPoints) {
      d3.select(this._svg)
        .append("g")
        .selectAll("circle")
        .data(this._data1.map(Object.values))
        .join("circle")
        .attr("r", 3)
        .attr("cx", (d) => this._xScale(d[0]))
        .attr("cy", (d) => this._yScale1(d[1]))
        .style("fill", this._color);
    }

    return this._svg;
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

    this._yScale1 = yScale(this._data1, this._height, this._border);
    if (this._data2) this._fitPairedData();
    return this;
  }

  width(width) {
    this._width = width;

    // Same scale
    this._xScale = xScale(this._data1, this._width, this._border);
    if (this._data2) this._fitPairedData();
    return this;
  }

  border(border) {
    this._border = border;

    this._xScale = xScale(this._data1, this._width, this._border);
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
