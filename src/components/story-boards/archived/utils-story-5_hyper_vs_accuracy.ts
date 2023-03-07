import { readCSVFile } from "../utils-data";
import { LineAndDotPlot } from "./LineAndDotPlot";

/*********************************************************************************************************
 * - Prepare data
 *********************************************************************************************************/

let data;
let parameters;

/*
 * Load data
 */
export async function loadData(): Promise<void> {
  data = {};

  const csv = await readCSVFile(
    "/static/story-boards/ml-data/storyboard_data2.csv",
  );

  csv.forEach((row) => {
    row.date = new Date(row.date);
    row.layers = +row.layers;
    row.channels = +row.channels;
    row.kernel_size = +row.kernel_size;
    row.samples_per_class = +row.samples_per_class;
    row.mean_training_accuracy = +row.mean_training_accuracy;
    row.mean_test_accuracy = +row.mean_test_accuracy;
  });

  parameters = csv.columns.slice(1);

  console.log("utils-story-6:loadData: csv data:", data);
  console.log("utils-story-5:loadData: parameters:", parameters);

  csv.forEach((row) => {
    parameters.forEach((parameter) => {
      if (!data[parameter]) { 
        data[parameter] = [];
      } else if (data[parameter].find(({ x }) => x === +row[parameter])) {
         console.log(); 
      } else {
          data[parameter].push({
          x: +row[parameter],
          y: +row.mean_training_accuracy,
        });
      }
      // prettier-ignore
      // console.log("utils-story-5:loadData: parameter:", parameter, "row[parameter]:", row[parameter]);
    });
    // console.log(row);
  });

  console.log("utils-story-5:loadData: data:", data);
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
  selectedParamaterData = data[parameter];
  // prettier-ignore
  console.log("utils-story-5:filterData: selectedParamaterData", selectedParamaterData);
}

/*********************************************************************************************************
 * - Create or init TimeSeries.
 * - Animate when button is clicked.
 *********************************************************************************************************/

let ts;

export function createPlot(selector: string) {
  console.log("utils-story-5: createPlot: selector = ", selector);

  ts = new LineAndDotPlot()
    .data(selectedParamaterData)
    .selector(selector)
    .title(`Basic story of ${parameter}`)
    .yLabel("accuracy")
    .xLabel(`${parameter}`)
    .annoTop()
    .ticks(30);

  ts.plot();
}

export function animatePlot(counter: number) {
  // prettier-ignore
  console.log("utils-story-5: animatePlot: counter: ", counter);
  ts.animate(counter);
}
