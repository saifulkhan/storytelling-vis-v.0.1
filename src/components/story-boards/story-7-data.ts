import * as d3 from "d3";
import { readCSVFile } from "./utils-data";
import { AnimationType } from "src/models/ITimeSeriesData";

import { LearningCurve, LearningCurveData } from "./LearningCurve";

/*********************************************************************************************************
 * Prepare data
 *********************************************************************************************************/

let data;

const parameters = [
  "date",
  "mean_test_accuracy",
  "mean_training_accuracy",
  "channels",
  "kernel_size",
  "layers",
  "samples_per_class",
];
const selectableParameters = [
  "channels",
  "kernel_size",
  "layers",
  "samples_per_class",
];

/*
 * Load data
 */
export async function loadData(): Promise<void> {
  data = [];

  const csv = await readCSVFile(
    // "/static/story-boards/ml-data/test-parallel-coordinate.csv",
    "/static/story-boards/ml-data/storyboard_data2.csv",
  );
  // Convert to integer and date
  csv.forEach((row) => {
    row.index = +row.index;
    row.date = new Date(row.date);
    row.mean_test_accuracy = +row.mean_test_accuracy;
    row.mean_training_accuracy = +row.mean_training_accuracy;
    row.channels = +row.channels;
    row.kernel_size = +row.kernel_size;
    row.layers = +row.layers;
    row.samples_per_class = +row.samples_per_class;

    data.push(row);
  });
  // parameters = data.columns.slice(1);

  console.log("story-7-data:loadData: csv =", csv);
  console.log("story-7-data: loadData: data = ", data);
}

export function getParameters() {
  return selectableParameters;
}

/*********************************************************************************************************
 * Filter/select parameter
 *********************************************************************************************************/

let selectedParameter;
let min1 = 0,
  max1 = 0,
  min2 = 0,
  max2 = 0;

let filteredData: LearningCurveData[] = [];

export function filterData(_parameter: string) {
  selectedParameter = _parameter;
  // prettier-ignore
  console.log("story-7-data: filterData: selectedParameter = ", selectedParameter);
  filteredData = [];

  data.forEach((d, idx) => {
    let obj = filteredData.find((el) => el.x === d[selectedParameter]);

    if (obj) {
      obj.y.push(d["mean_test_accuracy"]);
    } else {
      obj = {
        index: 0,
        date: d["date"],
        y: [d["mean_test_accuracy"]],
        x: d[selectedParameter],
      } as LearningCurveData;

      filteredData.push(obj);
    }

    if (min1 > d["mean_test_accuracy"]) min1 = d["mean_test_accuracy"];
    if (max1 < d["mean_test_accuracy"]) max1 = d["mean_test_accuracy"];
    if (min2 > d["mean_training_accuracy"]) min2 = d["mean_training_accuracy"];
    if (max2 < d["mean_training_accuracy"]) max2 = d["mean_training_accuracy"];
  });

  // Sort data by selected keyz, e.g, "kernel_size"
  let idx = 0;
  filteredData = filteredData
    .slice()
    .sort((a, b) => d3.ascending(a.x, b.x))
    .map((d) => ({ ...d, index: idx++ })); // update index of the reordered data 0, 1, 2,...

  // prettier-ignore
  console.log("story-7-data: filterData: filteredData = ", filteredData);
}

/*********************************************************************************************************
 * Create or init TimeSeries.
 * Animate when button is clicked.
 *********************************************************************************************************/

let lc;

export function createPlot(selector: string) {
  // prettier-ignore
  console.log("story-7-data: createPlot: selector = ", selector, ", selectedParameter = ", selectedParameter);
  lc = new LearningCurve(selector)
    .data(filteredData)
    .title(`Story of accuracy vs. ${selectedParameter}`)
    .xLabel(selectedParameter)
    .yLabel("Test accuracy")
    .ticks(10)
    .lineColor("#909090")
    .lineStroke(1.5)
    .dotColor("#404040")
    .dotHighlightColor("#E84A5F")
    .plot();
}

export function animatePlot(animationType: AnimationType) {
  // prettier-ignore
  console.log("utils-story-5: animatePlot: animationType = ", animationType);
  lc.animate(animationType);
}
