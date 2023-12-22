import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { covid19data1 } from "src/services/covid19-data";
import { Timeseries } from "src/components/storyboards/plots/Timeseries";
import { Dot } from "src/components/storyboards/actions/Dot";
import { Peak } from "src/utils/storyboards/Peak";
import { searchPeaks } from "src/utils/storyboards/feature-search";
import { TimeseriesType } from "src/utils/storyboards/TimeseriesType";
import { sliceTimeseriesByDate } from "src/utils/storyboards/common";

const TestFeatures = () => {
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
      const data: TimeseriesType[] = d["Aberdeenshire"];
      console.log("TestFeatures: data = ", data);

      const peaks: Peak[] = searchPeaks(data, "cases/day");
      console.log("TestFeatures: peaks = ", peaks);

      const dataX = peaks.map((peak) =>
        sliceTimeseriesByDate(data, peak.start, peak.end),
      );

      console.log("dataX = ", dataX);

      const plot = new Timeseries(
        { showPoints: false, color: "#FFFFFF", sameScale: true },
        data,
        dataX,
      );
      plot.drawOn(svg).draw();

      peaks.forEach((peak) => {
        const coordinates = plot.coordinates(peak.date);
        const dot = new Dot({
          size: 5,
          color: "#FF0044",
          opacity: 0.3,
        });
        dot.drawOn(svg);
        dot.position(coordinates[2], coordinates[3]);
      });
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

export default TestFeatures;
