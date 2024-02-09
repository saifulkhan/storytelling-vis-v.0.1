import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { covid19data1 } from "src/services/covid19-data";
import { LinePlot } from "src/components/storyboards/plots/LinePlot";
import { Dot } from "src/components/storyboards/actions/Dot";
import { Peak } from "src/utils/storyboards/processing/Peak";
import { searchPeaks } from "src/utils/storyboards/processing/feature-search";
import { sliceTimeseriesByDate } from "src/utils/storyboards/processing/common";
import { TimeseriesDataType } from "src/types/TimeseriesType";

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

    console.log("svg = ", svg);

    covid19data1().then((d) => {
      const data: TimeseriesDataType[] = d["Aberdeenshire"];
      console.log("TestFeatures: data = ", data);

      const peaks: Peak[] = searchPeaks(data, "cases/day", 10);
      console.log("TestFeatures: peaks = ", peaks);

      const dataX = peaks.map((peak) =>
        sliceTimeseriesByDate(data, peak.start, peak.end),
      );

      console.log("dataX = ", dataX);

      const plot = new LinePlot()
        .properties({
          showPoints: false,
          color: "#FFFFFF",
          sameScale: true,
        })
        .data(data, dataX)
        .draw(svg);

      peaks.forEach((peak) => {
        const coordinates = plot.coordinates(peak.date);
        const dot = new Dot()
          .properties()
          .draw(svg)
          .coordinate(coordinates[2], coordinates[3]);
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
