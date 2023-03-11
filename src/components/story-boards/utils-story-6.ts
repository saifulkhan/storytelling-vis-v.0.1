import { readCSVFile } from "./utils-data";
import { ParallelCoordinate } from "./ParallelCoordinate";
import { AnimationType } from "src/models/ITimeSeriesData";
import { detectFeatures } from "./utils-feature-detection";
import { eventsToGaussian, maxBounds } from "./utils-aggregation-segmentation";

/*********************************************************************************************************
 * Prepare data
 *********************************************************************************************************/

let data; // all parameters data
let peaks;

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

  preparePeaks();
}

export function getParameters() {
  return selectableParameters;
}

function preparePeaks() {
  const timeSeries = data.map((d) => ({
    y: d.mean_training_accuracy,
    date: d.date,
  }));

  peaks = detectFeatures(timeSeries, {
    peaks: true,
    metric: "Daily Cases",
  });
  // prettier-ignore
  console.log("utils-story-6: preparePeaks: peaks = ", peaks);

  const rankPeaks = (peaks) => {
    const sorted = [...peaks].sort((p1, p2) => p1.height - p2.height);
    const nPeaks = peaks.length;
    const fifth = nPeaks / 5;

    sorted.forEach((p, i) => p.setRank(1 + Math.floor(i / fifth)));
  };

  // we apply the ranking function to the peak events
  rankPeaks(peaks);

  //prettier-ignore
  console.log("utils-story-6: preparePeaks: ranked peaks = ", peaks);

  const peaksGauss = eventsToGaussian(peaks, timeSeries);
  const peaksBounds = maxBounds(peaksGauss);

  // prettier-ignore
  console.log("utils-story-1: preparePeaks: peaksGauss = ", peaksGauss, ", peaksBounds = ", peaksBounds);
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
 * Create or init TimeSeries.
 * Animate when button is clicked.
 *********************************************************************************************************/

let plot;

export function createPlot(selector: string) {
  // prettier-ignore
  console.log("utils-story-6: createPlot: selector = ", selector, ", selectedParameter = ", selectedParameter);

  plot = new ParallelCoordinate()
    .selector(selector)
    .data(data, parameters)
    .draw(selectedParameter);
}

export function animatePlot(animationType: AnimationType) {
  // prettier-ignore
  console.log("utils-story-5: animatePlot: animationType = ", animationType);
  plot.animate(animationType);
}
