import { readCSVFile } from "./utils-data";
import { parallelCoordinate } from "./ParallelCoordinate";

/*********************************************************************************************************
 * - Prepare data
 *********************************************************************************************************/

let data;
let parameters;

/*
 * Load data
 */
export async function loadData(): Promise<void> {
  data = await readCSVFile(
    // "/static/story-boards/ml-data/test-parallel-coordinate.csv",
    "/static/story-boards/ml-data/storyboard_data2.csv",
  );

  data.forEach((row) => {
    row.date = new Date(row.date);
    row.layers = +row.layers;
    row.channels = +row.channels;
    row.kernel_size = +row.kernel_size;
    row.samples_per_class = +row.samples_per_class;
    row.mean_training_accuracy = +row.mean_training_accuracy;
    row.mean_test_accuracy = +row.mean_test_accuracy;
  });

  parameters = data.columns.slice(1);

  console.log("utils-story-6:loadData: csv data:", data);
}

export function getParameters() {
  return parameters;
}

/*********************************************************************************************************
 * Filter/select parameter
 *********************************************************************************************************/

let selectedParamaterData = [];
let parameter;
let segment;

export function filterData(_parameter: string, _segment: number) {
  parameter = _parameter;
  segment = _segment;
  // selectedParamaterData = allParamatersData[parameter];
  // prettier-ignore
  console.log("utils-story-5:filterData: selectedParamaterData", selectedParamaterData);
}

/*********************************************************************************************************
 * - Create or init TimeSeries.
 * - Animate when button is clicked.
 *********************************************************************************************************/

let ts;

export function createPlot(selector: string, parameter: string) {
  console.log("utils-story-6: createPlot: selector = ", selector, parameter);

  parallelCoordinate(selector, data, parameter);
}

export function animatePlot(
  counter: number,
) {
  // prettier-ignore
  // console.log("utils-story-5: animatePlot: counter: ", counter);
  // ts.animate(counter);
}
