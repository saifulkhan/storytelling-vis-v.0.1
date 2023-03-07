import * as d3 from "d3";
// import { legend as Legend } from "@d3/color-legend";

// convert the datetime string "Thu Feb 16 00:18:38 2023" to a date object
// function parseDate(dateString) {
//   const date = new Date(dateString);
//   return date;
// }

const margin = { top: 30, right: 50, bottom: 30, left: 50 };
const brushHeight = 50;
const deselectedColor = "#ddd";
const colors = d3.interpolateBrBG;

const label = (d) => d.name;

export function parallelCoordinate(_selector, _data, _parameter) {
  // data = FileAttachment("cars.csv").csv({ typed: true });
  // prettier-ignore
  console.log("ParallelCoordinate: _selector: ", _selector, ", parameter: ", _parameter);

  const data = _data;
  const selector = _selector;
  const keyz = _parameter;

  const keys = data.columns.slice(1);
  const height = keys.length * 120;
  console.log("ParallelCoordinate: data:", data, keys);

  const width = 1200;

  const formatTime = d3.timeFormat("%a %b %e %I:%M:%S %Y");
  // Thu Feb 16 00:18:38 2023

  const x = new Map(
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

  console.log("ParallelCoordinate: x:", x);
  console.log("ParallelCoordinate: x.get(keys):", x.get(keys));

  const y = d3.scalePoint(keys, [margin.top, height - margin.bottom]);
  const z = d3.scaleSequential(x.get(keyz).domain().reverse(), colors);

  const line = d3
    .line()
    .defined(([, value]) => value != null)
    .x(([key, value]) => x.get(key)(value))
    .y(([key]) => y(key));

  const brush = d3
    .brushX()
    .extent([
      [margin.left, -(brushHeight / 2)],
      [width - margin.right, brushHeight / 2],
    ])
    .on("start brush end", brushed);

  // TODO

  // const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
  d3.select(selector).select("svg").remove();

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  // .attr("viewBox", [0, 0, width, height]);
  // .node();

  const path = svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke-width", 1.5)
    .attr("stroke-opacity", 0.4)
    .selectAll("path")
    .data(data.slice().sort((a, b) => d3.ascending(a[keyz], b[keyz])))
    .join("path")
    .attr("stroke", (d) => z(d[keyz]))
    .attr("d", (d) => line(d3.cross(keys, [d], (key, d) => [key, +d[key]])))
    .append("title")
    .text((d) => d.name);

  svg
    .append("g")
    .selectAll("g")
    .data(keys)
    .join("g")
    .attr("transform", (d) => `translate(0,${y(d)})`)
    .each(function (d) {
      d3.select(this).call(d3.axisBottom(x.get(d)));
    })
    .call((g) =>
      g
        .append("text")
        .attr("x", margin.left)
        .attr("y", -6)
        .attr("text-anchor", "start")
        .attr("fill", "currentColor")
        .text((d) => d),
    )
    .call((g) =>
      g
        .selectAll("text")
        .clone(true)
        .lower()
        .attr("fill", "none")
        .attr("stroke-width", 5)
        .attr("stroke-linejoin", "round")
        .attr("stroke", "white"),
    )
    .call(brush);

  const selections = new Map();

  function brushed({ selection }, key) {
    if (selection === null) selections.delete(key);
    else selections.set(key, selection.map(x.get(key).invert));
    const selected = [];
    path.each(function (d) {
      const active = Array.from(selections).every(
        ([key, [min, max]]) => d[key] >= min && d[key] <= max,
      );
      d3.select(this).style("stroke", active ? z(d[keyz]) : deselectedColor);
      if (active) {
        d3.select(this).raise();
        selected.push(d);
      }
    });
    svg.property("value", selected).dispatch("input");
  }

  //  legend = Legend({ color: z, title: keyz });

  return svg.property("value", data).node();
}
