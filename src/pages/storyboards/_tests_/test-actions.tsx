import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Dot } from "src/components/storyboards/actions/Dot";
import { TextBox } from "src/components/storyboards/actions/TextBox";
import { Connector } from "src/components/storyboards/actions/Connector";
import { Circle } from "src/components/storyboards/actions/Circle";
import {
  AbstractAction,
  Coordinate,
} from "src/components/storyboards/actions/AbstractAction";
import { title } from "process";

const TestActions = () => {
  const chartRef = useRef(null);

  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const height = 500 - margin.top - margin.bottom;
  const width = 500 - margin.left - margin.right;

  useEffect(() => {
    if (!chartRef.current) return;
    console.log("useEffect triggered");

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      // .attr("transform", `translate(${margin.left},${margin.top})`)
      .node();

    const src: Coordinate = [200, 200];
    const dest: Coordinate = [200, 100];

    const textBox = new TextBox()
      .properties({
        title: "17-02-2024",
        message:
          "By {DATE}, the number of cases continued to climb higher in {REGION}.",
      })
      .svg(svg)
      .draw()
      .coordinate(src, dest);

    const dot = new Dot()
      .properties({
        size: 5,
        color: "#FF0000",
        opacity: 0.3,
      })
      .svg(svg)
      .draw()
      .coordinate(src, dest);

    const connector = new Connector()
      .properties({})
      .svg(svg)
      .draw()
      .coordinate(src, dest);

    /*
    const circle = new Circle()
      .properties({
        size: 10,
        color: "#000000",
        opacity: 1,
      })
      .svg(svg)
      .draw()
      .coordinate(src, dest);

    
    */

    const animate = async () => {
      //
      // test individually
      //
      /*
      await Promise.all([
        textBox.show(),
        dot.show(),
        circle.show(),
        connector.show(),
      ]);
      await Promise.all([
        textBox.hide(),
        dot.hide(),
        circle.hide(),
        connector.hide(),
      ]);
      await Promise.all([
        textBox.show(),
        dot.show(),
        circle.show(),
        connector.show(),
      ]);
    */
      //
      // test all together
      //
      /*
      const actions = [textBox, dot, circle, connector];
      await AbstractAction.show(actions);
      await AbstractAction.hide(actions);
      await AbstractAction.show(actions);
      */
    };

    animate();
  }, []);

  return (
    <>
      <svg
        ref={chartRef}
        style={{ width: "500", height: "500", border: "1px solid" }}
      ></svg>
    </>
  );
};

export default TestActions;
