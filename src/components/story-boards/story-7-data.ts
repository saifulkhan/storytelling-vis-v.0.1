import * as d3 from "d3";
import { readCSVFile } from "./utils-data";
import { AnimationType } from "src/models/AnimationType";
import { LearningCurve, LearningCurveData } from "./LearningCurve";

/*********************************************************************************************************
 * Prepare data
 *********************************************************************************************************/

let data;

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

let filteredData: LearningCurveData[] = [];
let current, maxTesting;

export function filterData(_parameter: string) {
  selectedParameter = _parameter;
  // prettier-ignore
  console.log("story-7-data: filterData: selectedParameter = ", selectedParameter);
  filteredData = [];

  data.forEach((d, idx) => {
    filteredData.push({
      index: 0,
      date: d.date,
      y: d.mean_test_accuracy,
      x: d[selectedParameter],
    } as LearningCurveData);
  });

  // Sort data by selected keyz, e.g, "kernel_size"
  let idx = 0;
  filteredData = filteredData
    .slice()
    .sort((a, b) => d3.ascending(a.date, b.date))
    .sort((a, b) => d3.ascending(a.x, b.x))
    .map((d) => ({ ...d, index: idx++ })); // update index of the reordered data 0, 1, 2,...

  // prettier-ignore
  console.log("story-7-data: filterData: filteredData = ", filteredData);
}

export function getMaxTestingAcc() {
  return data.reduce((a, b) =>
    a.mean_test_accuracy > b.mean_test_accuracy ? a : b,
  );
}

export function getCurrent() {
  return data.reduce((a, b) => (a.date > b.date ? a : b));
}

/*********************************************************************************************************
 * Create or init TimeSeries.
 * Animate when button is clicked.
 *********************************************************************************************************/

let lc;

export function createPlot(selector: string) {
  // prettier-ignore
  console.log("story-7-data: createPlot: selector = ", selector, ", selectedParameter = ", selectedParameter);

  const _current: LearningCurveData = filteredData.reduce((a, b) =>
    a.date > b.date ? a : b,
  );
  const _maxTesting = filteredData.reduce((a, b) => (a.y > b.y ? a : b));
  // prettier-ignore
  console.log("story-7-data: createPlot: _current = ", _current, "_maxTesting = ", _maxTesting);

  lc = new LearningCurve(selector)
    .data(filteredData)
    .title("")
    .xLabel(selectedParameter)
    .yLabel("Test accuracy")
    .ticks(10)
    .lineColor("#909090")
    .lineStroke(1.5)
    .dotColor("#404040")
    .dotHighlightColor("#E84A5F")
    .currentPoint(_current, "#FFA500")
    .maxPoint(_maxTesting, "#20B2AA")
    .plot();
}

export function animatePlot(animationType: AnimationType) {
  // prettier-ignore
  console.log("utils-story-5: animatePlot: animationType = ", animationType);
  lc.animate(animationType);
}
