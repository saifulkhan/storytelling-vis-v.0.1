import { readCSVFile } from "./utils-data";
import { findDateIdx } from "./utils-feature-detection";
import { AnimationType } from "src/models/ITimeSeriesData";
import { MirroredBarChart } from "./MirroredBarChart";
import { TimeSeries } from "./TimeSeries_new";
import { GraphAnnotation, LinePlotAnnotation } from "./GraphAnnotation_new";

/*********************************************************************************************************
 * - Prepare data
 *********************************************************************************************************/

let data; // all parameters data

const parameters = [
  "channels",
  "mean_training_accuracy",
  "mean_test_accuracy",
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
  data = {};

  const csv = await readCSVFile(
    "/static/story-boards/ml-data/storyboard_data2.csv",
  );
  // Convert to integer and date
  csv.forEach((row) => {
    row.date = new Date(row.date);
    row.layers = +row.layers;
    row.channels = +row.channels;
    row.kernel_size = +row.kernel_size;
    row.samples_per_class = +row.samples_per_class;
    row.mean_training_accuracy = +row.mean_training_accuracy;
    row.mean_test_accuracy = +row.mean_test_accuracy;
  });

  // prettier-ignore
  console.log("utils-story-5a: loadData: csv = ", csv);
  // const parameters = csv.columns.slice(0);
  // prettier-ignore
  console.log("utils-story-5a: loadData: parameters = ", parameters);

  csv.forEach((row) => {
    parameters.forEach((parameter) => {
      if (!data[parameter]) { 
        data[parameter] = [];
      } else if (data[parameter].find(({ y }) => y === +row[parameter])) {
         console.log("skip"); 
      } else {
        data[parameter].push({
          y: row[parameter],
          date: row.date,
          mean_test_accuracy: row.mean_test_accuracy,
          mean_training_accuracy: row.mean_training_accuracy,

        });
      }
      // prettier-ignore
      // console.log("utils-story-5:loadData: parameter:", parameter, "row[parameter]:", row[parameter]);
    });
    // console.log(row);
  });

  console.log("utils-story-5a: loadData: dataByParameters = ", data);
}

export function getParameters() {
  return selectableParameters;
}

/*********************************************************************************************************
 * Filter/select parameter
 *********************************************************************************************************/

let selectedData = []; // selected parameter data
let selectedParameter;
let lpAnnotations: LinePlotAnnotation[];

export function filterData(_parameter: string) {
  selectedParameter = _parameter;
  selectedData = data[selectedParameter].sort(function (a, b) {
    return a.date - b.date;
  });
  // prettier-ignore
  console.log("utils-story-5: filterData: selectedData = ", selectedData);

  calculateAnnotations();
}

/*********************************************************************************************************
 * Create annotation objects
 *********************************************************************************************************/

const HIGHLIGHT_BEST_COLOR = "#2196F3",
  HIGHLIGHT_DEFAULT_COLOR = "#474440",
  TITLE_COLOR = "#696969",
  BACKGROUND_COLOR = "#F5F5F5";

const ACCURACY_BAR_COLOR = "#F96F4C",
  PARAMETER_BAR_COLOR = "#d3d3d3",
  CIRCLE_HIGHLIGHT_COLOR = "#F96F4C",
  LINE1_STROKE_WIDTH = 1.5,
  LINE1_COLOR = "#d3d3d3",
  POINT_COLOR = "#696969";

function calculateAnnotations() {
  lpAnnotations = [];

  // Find index of highest attr (e.g., highest testing accuracy)
  const indexOfMax = (arr, attr) => {
    const max = Math.max(...arr.map((d) => d[attr]));
    return arr.findIndex((d) => d[attr] === max);
  };
  const maxIdx = indexOfMax(selectedData, "mean_test_accuracy");

  console.log("utils-story-5: calculateAnnotations: maxIdx = ", maxIdx);

  selectedData.forEach((d, idx) => {
    // feature 3:
    // highest testing accuracy (except the first run) -->
    // action 3:
    // message box, "On <time date>, a newly-trained model attended the best results so far with testing accuracy: y% and training accuracy is x%."
    // <Stop to allow reading>
    if (idx === maxIdx) {
      // prettier-ignore
      const msg =  `On ${d?.date?.toLocaleDateString()}, a newly-trained model achieved the best results so far with testing accuracy ${d?.mean_test_accuracy?.toFixed(2)}% and training accuracy ${d?.mean_training_accuracy?.toFixed(2)}%.`
      lpAnnotations.push(
        writeText(msg, d.date, selectedData, HIGHLIGHT_BEST_COLOR, true),
      );
    }

    // feature 2:
    // first test run -->
    // action 2:
    // possible implementation: display more detailed sentence in a  message box, e.g., "On <time-date>, a newly-trained model
    // resulted in testing accuracy of y% and training accuracy of x%,  denoted as y% [x%]."
    // <Stop to allow reading>
    else if (idx === 0) {
      // prettier-ignore
      const msg =  `On ${d?.date?.toLocaleDateString()}, a newly-trained model resulted in testing accuracy of ${d?.mean_test_accuracy?.toFixed(2)}% and training accuracy of ${d?.mean_training_accuracy?.toFixed(2)}%, denoted as ${d?.mean_test_accuracy?.toFixed(2)}% [${d?.mean_training_accuracy?.toFixed(2)}%].`
      lpAnnotations.push(
        writeText(msg, d.date, selectedData, HIGHLIGHT_DEFAULT_COLOR, true),
      );
    } else {
      //
      // feature 1:
      // a test run -->

      // action 1a:
      // display accuracy in number: possible implementation: display "y% [x%]" in a colour text (e.g.,
      // cyan), where y% is the testing accuracy, and x% is the training accuracy.
      //
      // prettier-ignore
      const msg = `Accuracy: ${d?.mean_test_accuracy?.toFixed(2)}% [${d?.mean_training_accuracy?.toFixed(2)}%]`;
      lpAnnotations.push(
        writeText(msg, d.date, selectedData, HIGHLIGHT_DEFAULT_COLOR, false),
      );

      // action 1b:
      // display the dot as a colour dot (e.g., dark orange), change all already-
      // displayed dots in the same parameters (except the chosen parameter, e.g., channel)
      // to the same colour cyan. Meanwhile change all other dots to dark grey.
      // TODO
    }
  });

  // Sort annotations
  lpAnnotations.sort((a1, a2) => a1.current - a2.current);
  lpAnnotations.push({ current: selectedData.length - 1 });
  // Set annotations starts to the previous annotation's end/current
  lpAnnotations
    .slice(1)
    .forEach(
      (d: LinePlotAnnotation, i) => (d.previous = lpAnnotations[i].current),
    );

  // prettier-ignore
  console.log("utils-story-5: calculateAnnotations: lpAnnotations = ", lpAnnotations);
}

function writeText(
  text,
  date,
  data,
  labelColor = HIGHLIGHT_DEFAULT_COLOR,
  showRedCircle = false,
): LinePlotAnnotation {
  // Find idx of event in data and set location of the annotation in opposite half of graph
  const idx = findDateIdx(date, data);

  const graphAnnotation = new GraphAnnotation()
    .title(date.toLocaleDateString())
    .label(text)
    .backgroundColor(BACKGROUND_COLOR)
    .titleColor(TITLE_COLOR)
    .labelColor(labelColor)
    .wrap(500);

  if (showRedCircle) {
    graphAnnotation.circleHighlight(CIRCLE_HIGHLIGHT_COLOR, 10);
  }

  const target = data[idx];
  graphAnnotation.unscaledTarget = [target.date, target.y];

  return {
    current: idx,
    graphAnnotation: graphAnnotation,
    fadeout: true,
  } as LinePlotAnnotation;
}

/*********************************************************************************************************
 * - Create or init TimeSeries.
 * - Animate when button is clicked.
 *********************************************************************************************************/

let ts;
let bc;

export function createPlot(selector1: string, selector2: string) {
  // prettier-ignore
  console.log("utils-story-5: createPlot: selector1 = ", selector1, ", selector2 = ", selector2);

  ts = new TimeSeries()
    .selector(selector1)
    .data1(selectedData)
    .color1(LINE1_COLOR)
    .strokeWidth1(LINE1_STROKE_WIDTH)
    .title(`Basic story of ${selectedParameter}`)
    .yLabel(`${selectedParameter}`)
    .ticks(10)
    .showPoints1()
    .pointsColor1(POINT_COLOR)
    // .plot(); // static plot
    .annotations(lpAnnotations)
    .annoTop()
    .showEventLines();

  bc = new MirroredBarChart()
    .selector(selector2)
    .data1(selectedData)
    .color1(ACCURACY_BAR_COLOR)
    .color2(PARAMETER_BAR_COLOR)
    .title(`Basic story of ${selectedParameter}`)
    .yLabel1(`accuracy`)
    .yLabel2(`${selectedParameter}`)
    .ticks(10)
    .lpAnnotations(lpAnnotations);

  // .plot(); // static plot
}

export function animatePlot(animationType: AnimationType) {
  // prettier-ignore
  console.log("utils-story-5: animatePlot: animationType = ", animationType);
  ts.animate(animationType);
  bc.animate(animationType);
}
