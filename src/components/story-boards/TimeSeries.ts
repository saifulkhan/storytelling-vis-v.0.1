/**
 * TimeSeries is a class that creates a time series graph
 * It is used in the following stories: 1, 3 (with scrolling timeline), potentially in 5, 5a
 */

import * as d3 from "d3";
import { GraphAnnotation, IGraphAnnotationWrapper } from "./GraphAnnotation";

export type TimeSeriesData = {
  date: Date;
  y: number;
};

const WIDTH = 1200,
  HEIGHT = 400,
  MARGIN = 50;

const xScale = (data: TimeSeriesData[], w = WIDTH, m = MARGIN) => {
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d: TimeSeriesData) => d.date))
    // .nice()
    .range([m, w - m]);
  return xScale;
};

const yScale = (data: TimeSeriesData[], h = HEIGHT, m = MARGIN) => {
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d: TimeSeriesData) => d.y))
    // .nice()
    .range([h - m, m]);
  return yScale;
};

export class TimeSeries {
  _selector: string;
  _svg: SVGSVGElement;
  _data1: TimeSeriesData[];
  _data2: TimeSeriesData[][];

  _title = "";
  _xLabel = "";
  _yLabel1 = "";
  _yLabel2 = "";
  _color1 = "Black";
  _color2: any[];
  _width: number;
  _height: number;
  _margin: number;
  _ticks = false;

  _showPoints1 = false; // TODO rename point or dot
  _pointsColor1 = "#A9A9A9";
  _showEventLines = true;

  _xScale: any;
  _yScale1: any;
  _yScale2: any;
  _isSameScale = false;

  _annotations: IGraphAnnotationWrapper[];
  _annoTop = false;
  _animationCounter = 0;

  _pathElements = [];
  _annotationElements = [];
  _dotElements = []; // TODO rename point or dot

  constructor() {
    //
  }

  /**************************************************************************************************************
   * Setters
   **************************************************************************************************************/

  /**
   * We pass height, width & margin here to keep it consistent with the svg() method.
   * All stories except story 3 use this method.
   */
  selector(selector, height = HEIGHT, width = WIDTH, margin = MARGIN) {
    this._selector = selector;
    this._height = height;
    this._width = width;
    this._margin = margin;

    d3.select(this._selector).select("svg").remove();

    this._svg = d3
      .select(this._selector)
      .append("svg")
      .attr("width", this._width)
      .attr("height", this._height)
      .node();

    // this.width(this._width);
    // this.height(this._height);

    return this;
  }

  /**
   * The svg canvas is passed as an argument.
   * The story 3 used this method.
   */
  svg(svg) {
    this._svg = svg;
    // d3.select(this._selector).select("svg").remove();

    const bounds = svg.getBoundingClientRect();
    this.height = bounds.height;
    this.width = bounds.width;

    // this.width(bounds.width);
    // this.height(bounds.height);

    return this;
  }

  data1(data1: TimeSeriesData[]) {
    this._data1 = data1;
    return this;
  }

  data2(data2: TimeSeriesData[][]) {
    this._data2 = data2;
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
    this._yLabel1 = yLabel;
    return this;
  }

  yLabel2(yLabel) {
    this._yLabel2 = yLabel;
    return this;
  }

  color2(color: string[]) {
    this._color2 = color;
    return this;
  }

  color1(color: string) {
    this._color1 = color;
    return this;
  }

  ticks(ticks) {
    this._ticks = ticks;
    return this;
  }

  height(height) {
    this._height = height;
    return this;
  }

  width(width) {
    this._width = width;
    return this;
  }

  margin(margin) {
    this._margin = margin;
    return this;
  }

  showPoints1() {
    this._showPoints1 = true;
    return this;
  }

  pointsColor1(pointsColor1) {
    this._pointsColor1 = pointsColor1;
    return this;
  }

  showEventLines() {
    this._showEventLines = true;
    return this;
  }

  /**
   * x
   */
  annotations(annotations: IGraphAnnotationWrapper[]) {
    console.log("TimeSeries1: annotations: 1 annotations: ", annotations);

    // We need to draw the axis and labels before we can compute the coordinates of the annotations
    this._drawAxisAndLabels();

    annotations.forEach((d: IGraphAnnotationWrapper) => {
      const annoObj: GraphAnnotation = d.graphAnnotation;

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

    return this;
  }

  annoTop() {
    this._annoTop = true;
    return this;
  }

  /**************************************************************************************************************
   * Drawing methods
   **************************************************************************************************************/

  /*
   * When we don't want to animate- simply add static path derived from the data points.
   */
  plot() {
    console.log("TimeSeries: plot:");
    this._clearSvg();
    this._drawAxisAndLabels();

    console.log(this._data1, this._color1);

    const line1 = d3
      .line()
      .x((d) => {
        return this._xScale(d.date);
      })
      .y((d) => {
        return this._yScale1(d.y);
      });

    // Draw data1 line
    d3.select(this._svg)
      .append("path")
      .attr("stroke", this._color1)
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .attr("d", line1(this._data1));

    // Draw all data2 lines
    if (this._data2) {
      const colors = this._color2;
      this._data2.forEach((data, i) => {
        d3.select(this._svg)
          .append("path")
          .attr("stroke", colors ? colors[i % colors.length] : this._color1)
          .attr("stroke-width", 3)
          .attr("fill", "none")
          .attr(
            "d",
            d3
              .line()
              .x((d) => this._xScale(d.date))
              .y((d) => this._yScale2(d.y))(data),
          );
      });
    }

    //
    // Add static annotations
    //
    if (this._annotations) {
      this._annotations.forEach((d, idx) => {
        console.log(typeof d, d);
        d.graphAnnotation &&
          d.graphAnnotation.id(`id-annotation-${idx}`).addTo(this._svg);
      });
      if (this._showEventLines) {
        const container = d3.select(this._svg);
        this._annotations.forEach(
          (d) =>
            d.graphAnnotation &&
            this._addEventLine(
              container,
              d.graphAnnotation._tx,
              d.graphAnnotation._ty,
            ),
        );
      }
    }

    // Show points of data1

    if (this._showPoints1) {
      d3.select(this._svg)
        .append("g")
        .selectAll("circle")
        .data(this._data1)
        .join("circle")
        .attr("r", 3)
        .attr("cx", (d) => this._xScale(d.date))
        .attr("cy", (d) => this._yScale1(d.y))
        .style("fill", this._pointsColor1);
    }

    return this._svg;
  }

  animate(counter: -1 | 0 | 1) {
    console.log("TimeSeries1: animate: counter: ", counter);

    //
    // At the beginning create a list of d3 paths and annotations
    //
    if (
      this._pathElements.length === 0 ||
      this._annotationElements.length === 0
    ) {
      this._createPaths();
      this._createAnnotations();
    }

    //
    // At the beginning create dots
    //
    if (this._dotElements.length === 0) {
      this._createDots();
    }

    if (counter === -1 && this._animationCounter - 1 >= 0) {
      this._animateBack();
      this._animationCounter -= 1;
    } else if (counter === 0) {
      this._animateBeginning();
      this._animationCounter = 0;
    } else if (
      counter === 1 &&
      this._animationCounter + 1 < this._annotations.length
    ) {
      this._animateForward();
      this._animationCounter += 1;
    }

    // prettier-ignore
    console.log("TimeSeries1: animate: _animationCounter: ", this._animationCounter)
  }

  /**************************************************************************************************************
   * Private methods
   **************************************************************************************************************/

  /*
   * Loop through all the annotation objects,
   * creates array of objects representing (for each annotation) segment path,
   * their length and animation duration
   */
  _createPaths() {
    // prettier-ignore
    console.log("TimeSeries: _createPaths: _data1: ", this._data1, "data2: ", this._data2);

    // TODO: debug this part with two lines and animation
    // const mergedData2Group = this._data2.group.map((d) => d);
    // const mergedData2Group = this._data2[0];
    // console.log("TimeSeries: _createPaths: mergedData2Group", mergedData2Group);

    this._pathElements = this._annotations.map((annotation) => {
      console.log("TimeSeries: _createPaths: annotation = ", annotation);

      // TODO: debug this part with 2 lines animation
      // Slice datapoints within the start and end idx of the segment
      let subPoints;
      if (annotation.useData2 && this._data2[0]) {
        subPoints = this._data2[0].slice(annotation.start, annotation.end + 1);
      } else {
        subPoints = this._data1.slice(annotation.start, annotation.end + 1);
      }

      const path = d3
        .select(this._svg)
        .append("path")
        .attr("stroke", annotation.color || this._color1)
        .attr("stroke-width", 3)
        .attr("fill", "none")
        .attr(
          "d",
          d3
            .line()
            .x((d) => this._xScale(d.date))
            .y((d) =>
              annotation.useData2 ? this._yScale2(d.y) : this._yScale1(d.y),
            )(subPoints),
        );

      const length = path.node().getTotalLength();

      // Set the path to be hidden initially
      path
        .attr("stroke-dasharray", length + " " + length)
        .attr("stroke-dashoffset", length);

      const duration = annotation.duration || length * 4;

      return { path: path, length: length, duration: duration };
    });

    // prettier-ignore
    console.log("TimeSeries1: _createPaths: _pathElements: ", this._pathElements);
  }

  _createDots() {
    if (!this._showPoints1) {
      return;
    }

    this._dotElements = this._annotations.map((_, idx) => {
      const point = this._data1[idx];

      if (point) {
        return d3
          .select(this._svg)
          .append("circle")
          .attr("r", 3)
          .attr("cx", (d) => this._xScale(point.date))
          .attr("cy", (d) => this._yScale1(point.y))
          .style("fill", this._pointsColor1)
          .style("opacity", 0);
      }
    });

    // prettier-ignore
    console.log("TimeSeries1: _createDots: _dotElements: ", this._dotElements);
  }

  /**
   *  Returns an array of objects representing annotation type and persistence
   */
  _createAnnotations() {
    let anno, annoObj, annoElem;

    this._annotationElements = this._annotations.map((annotation, idx) => {
      // Try to get the graphAnnotation object if undefined set array elem to false
      annoObj = annotation.graphAnnotation;
      if (!annotation.graphAnnotation) return false;

      // If annotation obj defined - add to svg and set opacity to 0 (hide it)
      anno = annoObj.id(`id-annotation-${idx}`);
      anno.addTo(this._svg);

      if (this._annoTop) {
        anno.y(this._margin + anno._annoHeight / 2);
        anno.updatePos(anno._x, anno._y);
      }

      annoElem = d3.select(`#id-annotation-${idx}`).style("opacity", 0);

      if (this._showEventLines) {
        const container = d3.select(`#id-annotation-${idx}`);
        this._addEventLine(container, anno._tx, anno._ty);
      }

      // return d3 selection of anno element and boolean indication whether to persist annotation
      return {
        anno: annoElem,
        fadeout: annotation.fadeout || false,
      };
    });

    // return this._annotations.map(createAnno);
    // prettier-ignore
    console.log("TimeSeries1: _createAnnotations: _annotationElements: ", this._annotationElements);
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

  /*
   * This will remove the current path
   * Show or hide the path elements to svg based on the animation counter value
   */
  _animateBeginning() {
    const idxTo = 0;
    const idxFrom = this._animationCounter + 1;
    console.log(`TimeSeries1: _animateBeginning: ${idxTo} <- ${idxFrom}`);

    // Disappear all annotations
    this._annotationElements.forEach((a) => {
      a.anno?.style("opacity", 0);
    });

    // Hide dots
    this._dotElements.forEach((d) => {
      d?.style("opacity", 0);
    });

    // Disappear lines from back
    this._pathElements
      .slice(idxTo, idxFrom + 1)
      .reverse()
      .forEach((d, i) => {
        d.path
          .transition()
          .ease(d3.easeLinear)
          .delay(500 * i) // TODO timing
          .duration(d.duration || 1000)
          .attr("stroke-dashoffset", d.length);
      });

    return;
  }

  /*
   * This will remove the current path
   * Show or hide the path elements to svg based on the animation counter value
   */
  _animateBack() {
    const currentIndex = this._animationCounter;
    // prettier-ignore
    console.log(`TimeSeries1: _animateBack: ${currentIndex} <- ${currentIndex + 1}`);

    // Hide all annotations first
    this._annotationElements.forEach((a) => {
      a.anno?.style("opacity", 0);
    });

    let delay = 500;
    const duration = 500;

    // Hide the dot
    const dotElement = this._dotElements[currentIndex];
    if (dotElement) {
      delay += duration;
      dotElement
        .transition()
        .delay(delay)
        .duration(duration)
        .style("opacity", 0);
    }

    // Disappear lines from back
    this._pathElements
      .slice(currentIndex, currentIndex + 1)
      .reverse()
      .forEach((d) => {
        // console.log(d);
        d.path
          .transition()
          .ease(d3.easeLinear)
          .delay(delay)
          .duration(duration)
          .attr("stroke-dashoffset", d.length);
      });

    // Show the earlier annotation
    const annotationElement = this._annotationElements[currentIndex - 1];
    if (annotationElement) {
      delay += duration;
      annotationElement.anno
        .transition()
        .delay(delay)
        .duration(duration)
        .style("opacity", 1);
    }

    return;
  }

  /*
   * This will show or hide the path elements to svg based on the animation counter value
   */
  _animateForward() {
    // Number of path segments
    const pathNum = this._annotations.length;
    // Use modulus to repeat animation sequence once counter > number of animation segments
    const currIdx = this._animationCounter % pathNum;
    const prevIdx = (this._animationCounter - 1) % pathNum;

    // Get path and annotations for current animation and previous one
    const currPathElement = this._pathElements[currIdx];
    const duration = currPathElement.duration || 1000;
    const currAnnotationElement = this._annotationElements[currIdx];
    const prevAnnotationElement = this._annotationElements[prevIdx];
    const currDotElement = this._dotElements[currIdx];

    // prettier-ignore
    console.log(`TimeSeries5: _animateForward: ${pathNum}, ${prevIdx}, ${currIdx}`);

    // If we have a previous annotation that needs to be faded out do so
    if (
      prevAnnotationElement &&
      prevAnnotationElement.fadeout &&
      prevIdx != pathNum - 1
    ) {
      prevAnnotationElement.anno
        .style("opacity", 1)
        .transition()
        .duration(500)
        .style("opacity", 0);
    }

    // If we have faded out we need to delay the following animations (value is 1000 if true)
    let fadeOutDelay =
      (prevAnnotationElement && prevAnnotationElement.fadeout && 500) + 500;

    // Animate current path with duration given by user
    currPathElement.path
      .transition()
      .ease(d3.easeLinear)
      .delay(fadeOutDelay)
      .duration(duration)
      .attr("stroke-dashoffset", 0);

    if (currDotElement) {
      fadeOutDelay += duration;
      currDotElement
        .transition()
        .ease(d3.easeLinear)
        .delay(fadeOutDelay)
        .duration(duration)
        .style("opacity", 1);
    }

    // Animate the fadein of annotation after the path has fully revealed itself
    if (currAnnotationElement) {
      fadeOutDelay += duration;
      currAnnotationElement.anno
        .transition()
        .delay(fadeOutDelay)
        .duration(500)
        .style("opacity", 1);
    }

    // Set the paths before current path to be visible (default to invisible at each step)
    this._pathElements
      .slice(0, currIdx)
      .forEach((p) => p.path.attr("stroke-dashoffset", 0));

    // Set the persisting annotations to be visible (default to invisible at each step)
    this._annotationElements.slice(0, currIdx).forEach((a) => {
      if (a && !a.fadeout) {
        a.anno.style("opacity", 1);
      }
    });
  }

  /**
   * Create axes and add labels
   */
  _drawAxisAndLabels() {
    console.log(`TimeSeries:_drawAxisAndLabels:`);

    // Combine all data before creating axis
    const data2Comb = this._data2?.reduce((comb, arr) => comb.concat(arr));
    const data1Data2Comb = data2Comb
      ? this._data1.concat(data2Comb)
      : this._data1;

    this._xScale = xScale(data1Data2Comb, this._width, this._margin);
    // Making all axis same scale
    this._yScale1 = yScale(data1Data2Comb, this._height, this._margin);
    this._yScale2 = this._yScale1;

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

    if (this._showPoints1) {
      selection
        .append("g")
        .selectAll("circle")
        .data(this._data1.map(Object.values))
        .join("circle")
        .attr("r", 3)
        .attr("cx", (d) => this._xScale(d[0]))
        .attr("cy", (d) => this._yScale1(d[1]))
        .style("fill", this._color1);
    }

    return this;
  }

  /**
   * Select all elements below svg with the selector "svg > *" and remove.
   * Otherwise it will keep drawing on top of the previous lines / scales.
   */
  _clearSvg() {
    d3.select(this._svg).selectAll("svg > *").remove();
  }

  /**************************************************************************************************************
   * Getters
   **************************************************************************************************************/

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
