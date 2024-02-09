import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { covid19data1 } from "src/services/covid19-data";
import { Timeseries } from "src/components/storyboards/plots/Timeseries";

const TestPlots = () => {
  const chartRef = useRef(null);

  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const height = 550;
  const width = 1500;

  useEffect(() => {
    if (!chartRef.current) return;
    console.log("useEffect triggered");

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .node();

    covid19data1().then((d) => {
      console.log(d);
      const data = d["Aberdeenshire"];
      const dataX = [d["Angus"], d["Barnet"]];
      new Timeseries()
        .properties({
          showPoints: true,
          sameScale: false,
        })
        .data(data, dataX)
        .draw(svg);
    });
  }, []);

  return (
    <>
      <svg
        ref={chartRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          border: "1px solid",
        }}
      ></svg>
    </>
  );
};

export default TestPlots;
