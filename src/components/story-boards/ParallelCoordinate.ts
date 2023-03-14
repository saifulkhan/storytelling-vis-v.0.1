import * as d3 from "d3";
import { AnimationType } from "src/models/ITimeSeriesData";
import { Oranges } from "./colormap";
import { GraphAnnotation, PCAnnotation } from "./GraphAnnotation_new";

const WIDTH = 1200,
  HEIGHT = 800,
  MARGIN = { top: 50, right: 50, bottom: 30, left: 50 };

const STATIC_LINE_COLORMAP = d3.interpolateBrBG,
  STATIC_LINE_OPACITY = 0.4,
  STATIC_DOT_OPACITY = 0.4;

const ANIMATE_COLORMAP = Oranges,
  HIGHLIGHT_COLOR = ANIMATE_COLORMAP[0],
  LINE_WIDTH = 1.5;
const DOT_RADIUS = 5;
const AXIS_HIGHLIGHT_COLOR = "#DE4E6B";

const xScaleMap = (data, keys, width, margin) => {
  return new Map(
    Array.from(keys, (key) => {
      // array of all keys, e.g.,  ['date', 'mean_test_accuracy', 'channels', 'kernel_size', 'layers', ...]
      // key is one of teh key, e.g., 'date'
      let scale;
      if (key === "date") {
        scale = d3.scaleTime(
          d3.extent(data, (d) => d[key]),
          [margin.left, width - margin.right],
        );
      } else {
        scale = d3.scaleLinear(
          d3.extent(data, (d) => +d[key]),
          [margin.left, width - margin.right],
        );
      }

      return [key, scale];
    }),
  );
};

const yScale = (keys, height, margin) => {
  return d3.scalePoint(keys, [margin.top, height - margin.bottom]);
};

export class ParallelCoordinate {
  _selector: string;
  _svg: SVGSVGElement;

  _width: number;
  _height: number;
  _margin: any;

  _data: any[];
  _AxisNames: string[];
  _selectedAxis: string;

  _xScaleMap;
  _yScale;
  _colorScale;

  _tmpCounter = 0;
  _pcAnnotations: PCAnnotation[] = [];
  _annotationElements: any[] = [];
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

    return this;
  }

  data(data: any[], keys: string[], selectedAxis: string) {
    this._data = data;
    this._AxisNames = keys;
    this._selectedAxis = selectedAxis;

    console.log("ParallelCoordinate: data = ", this._data);
    // prettier-ignore
    console.log("ParallelCoordinate: data: selector = ", this._selector, ", _AxisNames = ", this._AxisNames, ", _selectedAxis = ", this._selectedAxis);

    return this;
  }

  /**
   *
   */
  annotations(pcAnnotations: PCAnnotation[]) {
    this._pcAnnotations = pcAnnotations;
    // prettier-ignore
    console.log("ParallelCoordinate: annotations: _pcAnnotations = ", this._pcAnnotations);

    // We need to draw the axis and labels before we can compute the coordinates of the annotations
    this._drawAxisAndLabels();
    this._createPathsAndDots();

    // Middle of the any x-axis
    const dateScale = this._xScaleMap.get("date");
    const xMid =
      dateScale(this._data[this._data.length - 1].date) +
      dateScale(this._data[0].date) * 0.5;
    console.log("ParallelCoordinate: graphAnnotations: xMid = ", xMid);

    this._pcAnnotations.forEach((pcAnnotation: PCAnnotation) => {
      const graphAnnotation: GraphAnnotation = pcAnnotation?.graphAnnotation;

      if (pcAnnotation && graphAnnotation) {
        const xScale = this._xScaleMap.get(pcAnnotation.originAxis);
        const x = xScale(pcAnnotation.data[pcAnnotation.originAxis]);
        const y = this._yScale("mean_test_accuracy");

        graphAnnotation.x(x);
        graphAnnotation.y(y);
      }
    });

    this._createGraphAnnotations();

    // prettier-ignore
    console.log("ParallelCoordinate: annotations: _pcAnnotations = ", this._pcAnnotations);

    return this;
  }

  /**
   *
   */
  animate(animationType: AnimationType) {
    if (this._pcAnnotations[this._tmpCounter]) {
    }

    //
    // Reveal current line
    //
    d3.select(this._svg)
      .select(`#id-line-${this._tmpCounter}`)
      .style("stroke-opacity", 1);

    //
    // Reveal current dots
    //
    d3.select(this._svg)
      .select(`#id-circles-${this._tmpCounter}`) // return group
      .selectAll("circle")
      .style("opacity", 1); // reveal the circles

    //
    // Fadeaway previous line
    //
    const prevLine = d3
      .select(this._svg)
      .select(`#id-line-${this._tmpCounter - 1}`);

    // Slowly change color
    const duration = 2000 / ANIMATE_COLORMAP.length;
    let delay = 0;
    for (const d of ANIMATE_COLORMAP) {
      prevLine
        .transition()
        .ease(d3.easeLinear)
        .delay(delay)
        .duration(duration)
        .style("stroke", d);
      delay += duration;
    }
    // Disappear the line and change the color back to the original
    prevLine
      .transition()
      .ease(d3.easeLinear)
      .delay(delay)
      .duration(duration)
      .style("stroke-opacity", 0)
      .style("stroke", HIGHLIGHT_COLOR);

    //
    // Fadeaway previous circles
    //
    const prevCircles = d3
      .select(this._svg)
      .select(`#id-circles-${this._tmpCounter - 1}`) // return group
      .selectAll("circle");

    // Slowly change color
    delay = 0;
    for (const d of ANIMATE_COLORMAP) {
      prevCircles
        .transition()
        .ease(d3.easeLinear)
        .delay(delay)
        .duration(duration)
        .style("fill", d);
      delay += duration;
    }
    // Disappear the circles and change the color back to the original
    prevCircles
      .transition()
      .ease(d3.easeLinear)
      .delay(delay)
      .duration(duration)
      .style("opacity", 0)
      .style("fill", HIGHLIGHT_COLOR);

    this._animateAnnotation();
    this._tmpCounter++;
  }

  /**
   * Static plot of the parallel coordinate
   */
  plot() {
    this._drawAxisAndLabels();

    const line = d3
      .line()
      .defined(([, value]) => value != null)
      .x(([key, value]) => {
        // parameter and its value, e.g., kernel_size:11, layers:13, etc
        return this._xScaleMap.get(key)(value);
      })
      .y(([key]) => this._yScale(key));

    const cross = (d) =>
      d3.cross(this._AxisNames, [d], (key, d) => [key, +d[key]]);

    //
    // Draw lines
    //
    d3.select(this._svg)
      .append("g")
      .attr("fill", "none")
      .attr("stroke-width", LINE_WIDTH)
      .attr("stroke-opacity", STATIC_LINE_OPACITY)
      .selectAll("path")
      .data(this._data)
      .join("path")
      .attr("stroke", (d) => this._colorScale(d[this._selectedAxis])) // assign from a colormap
      .attr("d", (d) => {
        // d is a row of the data, e.g., {kernel_size: 11, layers: 13, ...}
        // cross returns an array of [key, value] pairs ['date', 1677603855000], ['mean_training_accuracy', 0.9], ['channels', 32], ['kernel_size', 3], ['layers', 13], ...
        const a = cross(d);
        const l = line(a);
        return l;
      })
      .attr("id", (d) => `id-line-${d.index}`);

    //
    // Append circles to the line
    //
    d3.select(this._svg)
      .append("g")
      .selectAll("g")
      .data(this._data)
      .enter()
      .append("g")
      .attr("id", (d) => {
        // d is a row of the data, e.g., {kernel_size: 11, layers: 13, ...}
        return `id-circles-${d.index}`;
      })
      .selectAll("circle")
      .data((d) => cross(d))
      .enter()
      .append("circle")
      .attr("r", DOT_RADIUS)
      .attr("cx", ([key, value]) => {
        // parameter and its value, e.g., kernel_size:11, layers:13, etc
        return this._xScaleMap.get(key)(value);
      })
      .attr("cy", ([key]) => this._yScale(key))
      // .style("fill", (d) => this._colorScale(d[this._selectedAxis])) // TODO: assign from _colorScale colormap
      .style("fill", "Gray")
      .style("opacity", STATIC_DOT_OPACITY);

    return this;
  }

  _createPathsAndDots() {
    const line = d3
      .line()
      .defined(([, value]) => value != null)
      .x(([key, value]) => {
        // parameter and its value, e.g., kernel_size: 11, layers: 13, etc
        return this._xScaleMap.get(key)(value);
      })
      .y(([key]) => this._yScale(key));

    const cross = (d) => {
      // given d is a row of the data, e.g., {date: 1677603855000, kernel_size: 11, layers: 13, ...},
      // cross returns an array of [key, value] pairs ['date', 1677603855000], ['mean_training_accuracy', 0.9], ['channels', 32], ['kernel_size', 3], ['layers', 13], ...
      return d3.cross(this._AxisNames, [d], (key, d) => [key, +d[key]]);
    };

    //
    // Draw lines
    //
    d3.select(this._svg)
      .append("g")
      .attr("fill", "none")
      .attr("stroke-width", LINE_WIDTH)
      .attr("stroke-opacity", 0)
      .selectAll("path")
      .data(this._data)
      .join("path")
      .attr("stroke", (d) => HIGHLIGHT_COLOR)
      .attr("d", (d) => {
        // d is a row of the data, e.g., {kernel_size: 11, layers: 13, ...}
        // cross returns an array of [key, value] pairs ['date', 1677603855000], ['mean_training_accuracy', 0.9], ['channels', 32], ['kernel_size', 3], ['layers', 13], ...
        const a = cross(d);
        const l = line(a);
        return l;
      })
      .attr("id", (d) => `id-line-${d.index}`);

    //
    // Append circles to the line
    //
    d3.select(this._svg)
      .append("g")
      .selectAll("g")
      .data(this._data)
      .enter()
      .append("g")
      .attr("id", (d) => {
        // d is a row of the data, e.g., {kernel_size: 11, layers: 13, ...}
        return `id-circles-${d.index}`;
      })
      .selectAll("circle")
      .data((d) => cross(d))
      .enter()
      .append("circle")
      .attr("r", DOT_RADIUS)
      .attr("cx", ([key, value]) => {
        // parameter and its value, e.g., key/value: kernel_size/11, layers/13, etc
        return this._xScaleMap.get(key)(value);
      })
      .attr("cy", ([key]) => this._yScale(key))
      .style("fill", HIGHLIGHT_COLOR)
      .style("opacity", 0);
  }

  /**
   * Create axes and add labels
   */
  _drawAxisAndLabels() {
    // Clear existing axis and labels
    d3.select(this._svg).selectAll("svg > *").remove();

    this._xScaleMap = xScaleMap(
      this._data,
      this._AxisNames,
      this._width,
      this._margin,
    );
    this._yScale = yScale(this._AxisNames, this._height, this._margin);
    this._colorScale = d3.scaleSequential(
      this._xScaleMap.get(this._selectedAxis).domain().reverse(),
      STATIC_LINE_COLORMAP,
    );
    // prettier-ignore
    console.log("ParallelCoordinate: _drawAxisAndLabels: _xScaleMap = ", this._xScaleMap);

    //
    // Draw axis and labels
    //
    const that = this;
    d3.select(this._svg)
      .append("g")
      .selectAll("g")
      .data(this._AxisNames)
      .join("g")
      .attr("transform", (d) => `translate(0,${this._yScale(d)})`)
      .each(function (d) {
        // draw axis for d = date, layers, kernel_size, ... etc.
        // change color of the selected axis for d = keyz
        if (d === that._selectedAxis) {
          d3.select(this)
            .attr("color", AXIS_HIGHLIGHT_COLOR)
            .call(d3.axisBottom(that._xScaleMap.get(d)));
        } else {
          d3.select(this).call(d3.axisBottom(that._xScaleMap.get(d)));
        }
      })
      // Label axis
      .call((g) =>
        g
          .append("text")
          .attr("x", this._margin.left)
          .attr("y", -6)
          .attr("text-anchor", "start")
          .attr("fill", (d) =>
            // change color of the selected axis label for d = keyz
            d === this._selectedAxis ? AXIS_HIGHLIGHT_COLOR : "currentColor",
          )
          .text((d) => d),
      );

    return this;
  }

  /**
   *  Returns an array of objects representing annotation type and persistence
   */
  _createGraphAnnotations() {
    this._annotationElements = [];

    this._pcAnnotations.forEach((d, idx) => {
      // Try to get the graphAnnotation object if undefined set array elem to false
      const graphAnnotation: GraphAnnotation = d?.graphAnnotation;
      if (!graphAnnotation) {
        this._annotationElements.push(null);
        return;
      }

      // If add to svg and set opacity to 0 (to hide it)
      graphAnnotation.id(`id-annotation-${idx}`).addTo(this._svg);

      // if (this._annoTop) {
      //   graphAnnotation.y(this._margin.top + graphAnnotation._annoHeight / 2);
      //   graphAnnotation.updatePos(graphAnnotation._x, graphAnnotation._y);
      // }

      // const annotationElement = d3
      //   .select(`#id-annotation-${idx}`)
      //   .style("opacity", 0);

      graphAnnotation.hide();

      // // Show the event line (dotted line) if enabled
      // if (this._showEventLines) {
      //   const container = d3.select(`#id-annotation-${idx}`);
      //   this._addEventLine(container, graphAnnotation._tx, graphAnnotation._ty);
      // }

      // d3 selection of annotation element and boolean indication whether to persist annotation
      this._annotationElements.push({
        // element: annotationElement,
        fadeout: d.fadeout || false,
      });
    });

    // prettier-ignore
    console.log("TimeSeries: _createGraphAnnotations: _annotationElements: ", this._annotationElements);
  }

  /**
   *
   */
  _animateAnnotation() {
    let delay = 0;
    let duration = 1000;

    const annotation = this._pcAnnotations[this._tmpCounter];
    if (!annotation) {
      return;
    }
    annotation.graphAnnotation.show();

    annotation.graphAnnotation.updatePosAnimate(600, 20);

    // currAnnotationElement.element
    //   .transition()
    //   .ease(d3.easeQuadIn)
    //   .duration(2000)
    //   .attr("transform", `translate(${0},${0})`);

    // let randomPointDate = this._data[this._tmpCounter].date;
    // let obj = this._data.find((d) => d.date === randomPointDate);
    // // prettier-ignore
    // console.log("ParallelCoordinate: _animateAnnotation: randomPointDate = ", randomPointDate, "obj = ", obj);

    // const testAccScale = this._xScaleMap.get("mean_test_accuracy");
    // const x = testAccScale(obj["mean_test_accuracy"]);
    // const y = this._yScale("mean_test_accuracy");
    // console.log("ParallelCoordinate: _animateAnnotation: x, y = ", x, y);

    // // draw circle at initial location
    // const circle = d3
    //   .select(this._svg)
    //   .append("circle")
    //   .attr("fill", "red")
    //   .attr("r", 5)
    //   .attr("transform", `translate(${x},${y})`);

    // // animate
    // circle
    //   .transition()
    //   .ease(d3.easeQuadIn)
    //   .duration(2000)
    //   .attr("transform", `translate(${0},${0})`);
  }
}
