import * as d3 from "d3";
import { AnimationType } from "src/models/ITimeSeriesData";
// import { legend as Legend } from "@d3/color-legend";

const WIDTH = 1200,
  HEIGHT = 800;
const MARGIN = { top: 50, right: 50, bottom: 30, left: 50 };
const LINE_COLOR_MAP = d3.interpolateBrBG;
const LINE_COLOR_FIXED = "#d3d3d3";
const LINE_WIDTH = 1.5;
const LINE_OPACITY = 0.4;
const DOT_RADIUS = 5;

const xScaleMap = (data, keys, width, margin) => {
  return new Map(
    Array.from(keys, (key) => {
      console.log(key);

      let scale;
      if (key === "date") {
        scale = d3.scaleTime(
          d3.extent(data, (d) => {
            // prettier-ignore
            // console.log("ParallelCoordinate: d[key]:", d[key], new Date(d[key]));
            return d[key];
          }),
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
  _keys: string[];
  _keyz: string;

  _xScaleMap;
  _yScale;
  _colorScale;

  _tmpCounter = 0;

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

  data(data: any[], keys: string[]) {
    this._data = data;
    this._keys = keys;
    return this;
  }

  /**
   *
   */
  draw(keyz: string) {
    d3.select(this._svg).selectAll("svg > *").remove();

    // Selected key
    this._keyz = keyz;

    this._xScaleMap = xScaleMap(
      this._data,
      this._keys,
      this._width,
      this._margin,
    );
    this._yScale = yScale(this._keys, this._height, this._margin);
    this._colorScale = d3.scaleSequential(
      this._xScaleMap.get(this._keyz).domain().reverse(),
      LINE_COLOR_MAP,
    );

    // prettier-ignore
    console.log("ParallelCoordinate: draw: selector = ", this._selector, ", data = ", this._data, ", keys = ", this._keys, ", keyz = ", this._keyz);
    // prettier-ignore
    console.log("ParallelCoordinate: draw: _xScaleMap = ", this._xScaleMap);

    const line = d3
      .line()
      .defined(([, value]) => value != null)
      .x(([key, value]) => {
        // prettier-ignore
        // console.log("line-> key = ", key, "value = ", value);
        return this._xScaleMap.get(key)(value);
      })
      .y(([key]) => this._yScale(key));

    // Sort data by selected keyz, e.g, "kernel_size"
    let idx = 0;
    const sortedData = this._data
      .slice()
      .sort((a, b) => d3.ascending(a[keyz], b[keyz]))
      .map((d) => ({ ...d, index: idx++ })); // update the index to 0,1,2,...
    console.log("ParallelCoordinate: sortedData = ", sortedData);

    const cross = (d) => d3.cross(this._keys, [d], (key, d) => [key, +d[key]]);

    //
    // Draw lines
    //
    const path = d3
      .select(this._svg)
      .append("g")
      .attr("fill", "none")
      .attr("stroke-width", LINE_WIDTH)
      .attr("stroke-opacity", 0)
      .selectAll("path")
      .data(sortedData)
      .join("path")
      // .attr("stroke", (d) => this._colorScale(d[this._keyz])) // assign from a colormap
      .attr("stroke", (d) => LINE_COLOR_FIXED)
      .attr("d", (d) => {
        const a = cross(d);
        // console.log("line-> d = ", d, ", cross = ", a);
        const l = line(a);
        return l;
      })
      .attr("id", (d) => `id-line-${d.index}`)
      .append("title") // giving title to the line
      .text((d) => {
        // console.log("d.name = ", d);
        return d.name; // TODO: assign proper values
      });

    //
    // Append circles to the line
    //
    d3.select(this._svg)
      // .append("g")
      .selectAll("g")
      .data(sortedData)
      .enter()
      .append("g")
      .attr("id", (d) => {
        console.log("circle group-> d = ", d);
        return `id-circles-${d.index}`;
      })
      .style("opacity", 0)
      .selectAll("circle")
      .data((d) => cross(d))
      .enter()
      .append("circle")
      .attr("r", DOT_RADIUS)
      .attr("cx", ([key, value]) => {
        // const a = cross(d);
        console.log("circle -> key = ", key, ", value = ", value);
        return this._xScaleMap.get(key)(value);
      })
      .attr("cy", ([key]) => this._yScale(key))
      .style("fill", "green");

    //
    // Draw axis lines
    //
    const that = this;
    d3.select(this._svg)
      .append("g")
      .selectAll("g")
      .data(this._keys)
      .join("g")
      .attr("transform", (d) => `translate(0,${this._yScale(d)})`)
      .each(function (d) {
        d3.select(this).call(d3.axisBottom(that._xScaleMap.get(d)));
      })
      // Draw name of axis
      .call((g) =>
        g
          .append("text")
          .attr("x", this._margin.left)
          .attr("y", -6)
          .attr("text-anchor", "start")
          .attr("fill", "currentColor")
          .text((d) => d),
      );

    return this;
  }

  /**
   *
   */
  animate(animationType: AnimationType) {
    const selectedPath = d3
      .select(this._svg)
      .select(`#id-line-${this._tmpCounter}`);
    const prevColour = selectedPath.attr("fill");
    const totalLength = selectedPath.node().getTotalLength();

    selectedPath
      // .attr("stroke-dasharray", totalLength + " " + totalLength)
      // .attr("stroke-dashoffset", totalLength)
      // .attr("stroke", "red")
      .transition()
      .duration(0)
      .style("stroke-opacity", 1)
      // .transition()
      // .duration(2000)
      // .ease(d3.easeLinear)
      // .attr("stroke-dashoffset", 0)
      .transition()
      .duration(0)
      .style("stroke", "green")
      .transition()
      .duration(2000)
      .ease(d3.easeBounceInOut)
      .attr("stroke-width", 3)
      .transition()
      .duration(0)
      .attr("stroke-width", LINE_WIDTH)
      .transition()
      .duration(0)
      .style("stroke", prevColour)
      .transition()
      .duration(0)
      .attr("stroke-opacity", LINE_OPACITY);

    const currentCircles = d3
      .select(this._svg)
      .select(`#id-circles-${this._tmpCounter}`)
      .style("opacity", 1);

    const previousCircles = d3
      .select(this._svg)
      .select(`#id-circles-${this._tmpCounter - 1}`)
      .style("opacity", 0);

    this._tmpCounter++;
  }
}
