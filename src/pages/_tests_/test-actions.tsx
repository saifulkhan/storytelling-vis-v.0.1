import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Dot } from "src/components/storyboards/actions/Dot";
import { TextBox } from "src/components/storyboards/actions/TextBox";

const TestAction = () => {
  const chartRef = useRef(null);

  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const height = 500 - margin.top - margin.bottom;
  const width = 500 - margin.left - margin.right;

  useEffect(() => {
    if (!chartRef.current) return;

    console.log("useEffect triggered");

    function execFuncsInInterval(functionsArray, intervalTime) {
      let index = 0;

      function execute() {
        if (index < functionsArray.length) {
          const currentFunction = functionsArray[index];
          if (typeof currentFunction === "function") {
            currentFunction();
          }
          index++;
        } else {
          clearInterval(interval);
        }
      }

      const interval = setInterval(execute, intervalTime);
    }

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      // .attr("transform", `translate(${margin.left},${margin.top})`)
      .node();

    //
    // Test action dot
    //
    let props = {
      size: 8,
      color: "#000000",
      opacity: 0.3,
      x: 20,
      y: 20,
    };
    /*
    const dot = new Dot(props);
    const funcs = [
      dot.drawOn(svg),
      dot.hide(),
      dot.show(),
      dot.reposition(50, 50),
      dot.hide(),
      dot.show(),
      dot.reposition(100, 50),
    ];
    execFuncsInInterval(funcs, 10000);
  */

    //
    // Test action textbox
    //
    props = {};
    const textbox = new TextBox(props);
    textbox.drawOn(svg);
    textbox.show();
    textbox.reposition(100, 100);
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

export default TestAction;
