import * as d3 from "d3";
import { AnimationType } from "src/models/ITimeSeriesData";
import { Oranges } from "./colormap";
import {
  GraphAnnotation,
  HIGHLIGHT_TYPE,
  PCAnnotation,
} from "./GraphAnnotation_new";

const WIDTH = 1000,
  HEIGHT = 600,
  MARGIN = { top: 50, right: 50, bottom: 30, left: 50 };

const STATIC_LINE_COLORMAP = d3.interpolateBrBG,
  STATIC_LINE_OPACITY = 0.4,
  STATIC_DOT_OPACITY = 0.4;

const ANIMATE_COLORMAP = Oranges,
  LINE_WIDTH = 1.5;
const DOT_RADIUS = 5;
const AXIS_HIGHLIGHT_COLOR = "#DE4E6B";
const DELAY = 500,
  DURATION1 = 1000,
  DURATION2 = 1500;

const FONT_SIZE = "12px",
  TITLE_FONT_SIZE = "13px",
  ANNOTATION_Y_POS = 20,
  ANNOTATION_XMID_OFFSET = 140;

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

  _annotations: PCAnnotation[] = [];
  _animationCounter = 0;

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
      .style("font-size", FONT_SIZE)
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

  /*********************************************************************************************************
   * Animation used in story 6
   *********************************************************************************************************/

  /**
   * Set annotations.
   */
  annotations(pcAnnotations: PCAnnotation[]) {
    this._annotations = pcAnnotations;
    // prettier-ignore
    console.log("ParallelCoordinate: annotations: _pcAnnotations = ", this._annotations);

    // We need to draw the axis and labels before we can compute the coordinates of the annotations
    this._drawAxisAndLabels();
    this._createPathsAndDots();

    this._createAnnotations();

    // prettier-ignore
    console.log("ParallelCoordinate: annotations: _pcAnnotations = ", this._annotations);

    return this;
  }

  /**
   *
   */

  animate(animationType: AnimationType) {
    console.log("TimeSeries: animate: animationType = ", animationType);

    if (animationType === "back" && this._animationCounter >= 0) {
      this._animateBack();
      this._animationCounter -= 1;
    } else if (animationType === "beginning") {
      this._animateBeginning();
      this._animationCounter = -1;
    } else if (
      animationType === "play" &&
      this._animationCounter + 1 < this._annotations.length
    ) {
      this._animateForward();
      this._animationCounter += 1;
    }

    // prettier-ignore
    console.log("TimeSeries: animate: _animationCounter: ", this._animationCounter)
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
      .data(this._annotations)
      .join("path")
      .attr("stroke", (d) => d?.highlightColor)
      .attr("d", (d: PCAnnotation) => {
        // d.data is a data point, e.g., {kernel_size: 11, layers: 13, ...}
        // cross returns an array of [key, value] pairs ['date', 1677603855000], ['mean_training_accuracy', 0.9], ['channels', 32], ['kernel_size', 3], ['layers', 13], ...
        const a = cross(d?.data);
        const l = line(a);
        return l;
      })
      .attr("id", (d) => `id-line-${d?.data?.index}`);

    //
    // Append circles to the line
    //
    const that = this;
    d3.select(this._svg)
      .append("g")
      .selectAll("g")
      .data(this._annotations)
      .enter()
      .append("g")
      .attr("id", (d) => {
        // d is a row of the data, e.g., {kernel_size: 11, layers: 13, ...}
        return `id-circles-${d?.data?.index}`;
      })
      .selectAll("circle")
      .data((d) => cross(d?.data))
      .enter()
      .append("circle")
      .attr("r", DOT_RADIUS)
      .attr("cx", ([key, value]) => {
        // parameter and its value, e.g., key/value: kernel_size/11, layers/13, etc
        const xScale = this._xScaleMap.get(key);
        return xScale(value);
      })
      .attr("cy", ([key]) => this._yScale(key))
      .style("fill", function (d) {
        // get the parent node data, i.e., pcAnnotation
        const parent = d3.select(this.parentNode).datum();
        return parent?.highlightColor;
      })
      .style("opacity", 0);
  }

  _createAnnotations() {
    // Middle of the any x-axis
    const dateScale = this._xScaleMap.get("date");
    const xMid =
      (dateScale(this._data[this._data.length - 1].date) +
        dateScale(this._data[0].date)) *
      0.5;
    console.log("ParallelCoordinate: graphAnnotations: xMid = ", xMid);

    // Position annotations & hide them
    this._annotations.forEach((d, idx) => {
      // Try to get the graphAnnotation object if undefined set array elem to false
      const graphAnnotation: GraphAnnotation = d?.graphAnnotation;
      if (!graphAnnotation) {
        return;
      }

      if (d && graphAnnotation) {
        const xScale = this._xScaleMap.get(d.originAxis);
        const x = xScale(d.data[d.originAxis]);
        const y = this._yScale(d.originAxis);

        graphAnnotation.x(x);
        graphAnnotation.y(y);

        // If add to svg and set opacity to 0 (to hide it)
        graphAnnotation.id(`id-annotation-${idx}`).addTo(this._svg);
        graphAnnotation.hide();

        // Save the coordinates in PCAnnotation object

        d.origin = [x, y];

        if (d.highlightType === HIGHLIGHT_TYPE.BEST) {
          d.destination = [xMid - ANNOTATION_XMID_OFFSET, ANNOTATION_Y_POS];
        } else if (d.highlightType === HIGHLIGHT_TYPE.WORST) {
          d.destination = [xMid + ANNOTATION_XMID_OFFSET, ANNOTATION_Y_POS];
        }
      }
    });
  }

  private _animateForward() {
    const currAnnotation: PCAnnotation =
      this._annotations[this._animationCounter];

    const prevAnnotation: PCAnnotation =
      this._annotations[this._animationCounter - 1];

    // Show current line
    d3.select(this._svg)
      .select(`#id-line-${this._animationCounter}`)
      .style("stroke-opacity", 1);

    // show current dots
    d3.select(this._svg)
      .select(`#id-circles-${this._animationCounter}`) // return group
      .selectAll("circle")
      .style("opacity", 1); // reveal the circles

    // Show the annotation and move it to the destination
    currAnnotation?.graphAnnotation?.show();
    currAnnotation?.graphAnnotation?.updatePosAnimate(
      currAnnotation.destination[0],
      currAnnotation.destination[1],
    );

    // Hide previous default line & dots
    if (
      prevAnnotation?.highlightType === HIGHLIGHT_TYPE.DEFAULT &&
      this._animationCounter - 1 >= 0
    ) {
      this._hideLineWithId(this._animationCounter - 1);
      this._hideDotWithId(this._animationCounter - 1);
    }

    // Check if there is any BEST line exists
    if (currAnnotation?.highlightType === HIGHLIGHT_TYPE.BEST) {
      this._annotations.slice(0, this._animationCounter).forEach((d, idx) => {
        if (d.highlightType === HIGHLIGHT_TYPE.BEST) {
          this._hideLineWithId(idx);
          this._hideDotWithId(idx);
        }
      });
    }

    // Check if there is any WORST line exists
    if (currAnnotation?.highlightType === HIGHLIGHT_TYPE.WORST) {
      this._annotations.slice(0, this._animationCounter).forEach((d, idx) => {
        if (d.highlightType === HIGHLIGHT_TYPE.WORST) {
          this._hideLineWithId(idx);
          this._hideDotWithId(idx);
        }
      });
    }
  }

  private _animateBeginning() {
    throw new Error("Method not implemented.");
  }
  private _animateBack() {
    throw new Error("Method not implemented.");
  }

  private _hideLineWithId(id: number) {
    d3.select(this._svg)
      .select(`#id-line-${id}`)
      .transition()
      .ease(d3.easeLinear)
      .delay(DELAY)
      .duration(DURATION1)
      .style("stroke-opacity", 0.5)
      .style("stroke", "#d3d3d3");
  }

  private _hideDotWithId(id: number) {
    d3.select(this._svg)
      .select(`#id-circles-${id}`) // returns group
      .selectAll("circle")
      .transition()
      .ease(d3.easeLinear)
      .delay(DELAY)
      .duration(DURATION1)
      .style("opacity", 0);

    // using cmap
    // delay = 0;
    // for (const d of ANIMATE_COLORMAP) {
    //   prevCircles
    //     .transition()
    //     .ease(d3.easeLinear)
    //     .delay(delay)
    //     .duration(duration)
    //     .style("fill", d);
    //   delay += duration;
    // }
    // // Disappear the circles and change the color back to the original
    // prevCircles
    //   .transition()
    //   .ease(d3.easeLinear)
    //   .delay(delay)
    //   .duration(duration)
    //   .style("opacity", 0)
    //   .style("fill", HIGHLIGHT_COLOR);
  }
}
