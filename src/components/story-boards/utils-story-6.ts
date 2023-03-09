import { readCSVFile } from "./utils-data";
import { ParallelCoordinate } from "./ParallelCoordinate";
import { AnimationType } from "src/models/ITimeSeriesData";

/*********************************************************************************************************
 * - Prepare data
 *********************************************************************************************************/

let allData; // all parameters data

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
  allData = [];

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

    allData.push(row);
  });
  // parameters = data.columns.slice(1);

  console.log("utils-story-6:loadData: csv =", csv);
  console.log("utils-story-6: loadData: allData = ", allData);
}

export function getParameters() {
  return selectableParameters;
}

/*********************************************************************************************************
 * Filter/select parameter
 *********************************************************************************************************/

let selectedParameter;

export function filterData(_parameter: string) {
  selectedParameter = _parameter;
  // prettier-ignore
  console.log("utils-story-6: filterData: selectedParameter", selectedParameter);
}

/*********************************************************************************************************
 * - Create or init TimeSeries.
 * - Animate when button is clicked.
 *********************************************************************************************************/

let plot;

export function createPlot(selector: string) {
  // prettier-ignore
  console.log("utils-story-6: createPlot: selector = ", selector, ", selectedParameter = ", selectedParameter);

  plot = new ParallelCoordinate()
    .selector(selector)
    .data(allData, parameters)
    .draw(selectedParameter);
}

export function animatePlot(animationType: AnimationType) {
  // prettier-ignore
  console.log("utils-story-5: animatePlot: animationType = ", animationType);
  plot.animate(animationType);
}
