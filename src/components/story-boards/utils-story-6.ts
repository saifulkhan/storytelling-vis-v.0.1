import * as d3 from "d3";
import { readCSVFile } from "./utils-data";
import { ParallelCoordinate } from "./ParallelCoordinate";
import { AnimationType } from "src/models/ITimeSeriesData";
import { GraphAnnotation, PCAnnotation } from "./GraphAnnotation_new";

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

  console.log("utils-story-6:loadData: csv =", csv);
  console.log("utils-story-6: loadData: data = ", data);
}

export function getParameters() {
  return selectableParameters;
}

/**
 * Given a list of numbers, find the local minimum and maximum data points
 */

function findLocalMinMax1(input: any[], keyz: string, window = 2): any {
  // prettier-ignore
  console.log("utils-story-6: findLocalMinMax1: input = ", input, ", keyz = ", keyz);

  // Given two numbers, return -1, 0, or 1
  const compare = (a: number, b: number): number => {
    if (a === b) {
      return 0;
    }
    if (a < b) {
      return -1;
    }
    return 1;
  };

  const outputMin = [];
  const outputMax = [];

  // keep track of the direction: down vs up
  let direction = 0;
  let prevEqual = true;

  // if 0th != 1st, 0th is a local min / max
  if (input[0][keyz] !== input[1][keyz]) {
    direction = compare(input[0][keyz], input[1][keyz]);
    prevEqual = false;

    direction === -1 && outputMin.push(input[0]);
    direction === 1 && outputMax.push(input[0]);
  }

  // loop through other numbers
  for (let i = 1; i < input.length - 1; i++) {
    // compare this to next
    const nextDirection = compare(input[i][keyz], input[i + 1][keyz]);
    if (nextDirection !== 0) {
      if (nextDirection !== direction) {
        direction = nextDirection;
        // if we didn't already count value, add it here
        if (!prevEqual) {
          direction === -1 && outputMin.push(input[i]);
          direction === 1 && outputMax.push(input[i]);
        }
      }
      prevEqual = false;
    } else if (!prevEqual) {
      // if the previous value is different and the next are equal
      // then we've found a min/max
      prevEqual = true;
      direction === -1 && outputMin.push(input[i]);
      direction === 1 && outputMax.push(input[i]);
    }
  }

  // check last index
  if (
    compare(input[input.length - 2][keyz], input[input.length - 1][keyz]) !== 0
  ) {
    direction === -1 && outputMin.push(input[input.length - 1]);
    direction === 1 && outputMax.push(input[input.length - 1]);
  }

  // prettier-ignore
  console.log("utils-story-6: findLocalMinMax1: outputMin = ", outputMin);
  console.log("utils-story-6: findLocalMinMax1: outputMax = ", outputMax);

  return [outputMin, outputMax];
}

/*********************************************************************************************************
 * Filter/select parameter
 *********************************************************************************************************/

let selectedParameter;
let min, max;
let pcAnnotations: PCAnnotation[];

const COLOR_TITLE = "#696969",
  COLOR_BACKGROUND = "#F5F5F5",
  HIGHLIGHT_BEST_COLOR = "#00bfa0",
  HIGHLIGHT_WORST_COLOR = "#E84A5F";

export function filterData(_parameter: string) {
  selectedParameter = _parameter;

  // Sort data by selected keyz, e.g, "kernel_size"
  let idx = 0;
  data = data
    .slice()
    .sort((a, b) => d3.ascending(a[selectedParameter], b[selectedParameter]))
    .sort((a, b) => d3.ascending(a["date"], b["date"]))
    .map((d) => ({ ...d, index: idx++ })); // update index of the reordered data 0, 1, 2,...

  [min, max] = findLocalMinMax1(data, "mean_test_accuracy");

  console.log("utils-story-6: filterData: data (after sorting) = ", data);

  calculateAnnotations();

  // prettier-ignore
  console.log("utils-story-6: filterData: selectedParameter = ", selectedParameter);
}

function calculateAnnotations() {
  pcAnnotations = [];

  data.forEach((d, idx) => {
    // min annotation
    if (min.find((el) => el.index === idx)) {
      // prettier-ignore
      const msg = `Worst testing accuracy so far: ${d?.mean_test_accuracy?.toFixed(2,)}% [${d?.mean_training_accuracy?.toFixed(2)}%]`;
      pcAnnotations.push(
        writeText(msg, d.date, d, HIGHLIGHT_WORST_COLOR, false),
      );
    }
    // max annotation
    else if (max.find((el) => el.index === idx)) {
      // prettier-ignore
      const msg = `Best testing accuracy so far: ${d?.mean_test_accuracy?.toFixed(2,)}% [${d?.mean_training_accuracy?.toFixed(2)}%]`;
      pcAnnotations.push(
        writeText(msg, d.date, d, HIGHLIGHT_BEST_COLOR, false),
      );
    }
    // no annotation
    else {
      pcAnnotations.push(null);
    }
  });
}

function writeText(
  text,
  date,
  data,
  highlightColor,
  showRedCircle,
): PCAnnotation {
  const graphAnnotation = new GraphAnnotation()
    .title(date.toLocaleDateString())
    .label(text)
    .backgroundColor(COLOR_BACKGROUND)
    .titleColor(COLOR_TITLE)
    .labelColor(highlightColor)
    .wrap(500);

  if (showRedCircle) {
    graphAnnotation.circleHighlight(highlightColor, 10);
  }

  return {
    graphAnnotation: graphAnnotation,
    fadeout: false,
    highlightColor: highlightColor,
    originAxis: "mean_test_accuracy",
    data: data,
  } as PCAnnotation;
}

/*********************************************************************************************************
 * Create or init TimeSeries.
 * Animate when button is clicked.
 *********************************************************************************************************/

let plot;

export function createPlot(selector: string) {
  // prettier-ignore
  console.log("utils-story-6: createPlot: selector = ", selector, ", selectedParameter = ", selectedParameter);

  plot = new ParallelCoordinate()
    .selector(selector)
    .data(data, parameters, selectedParameter)
    // .plot(); // static plot
    .annotations(pcAnnotations);
}

export function animatePlot(animationType: AnimationType) {
  // prettier-ignore
  console.log("utils-story-5: animatePlot: animationType = ", animationType);
  plot.animate(animationType);
}
