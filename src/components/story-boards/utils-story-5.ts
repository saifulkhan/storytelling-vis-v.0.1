import { readCSVFile } from "./utils-data";
import { GraphAnnotation, IGraphAnnotationWrapper } from "./GraphAnnotation";
import { TimeSeries } from "./TimeSeries";
import { findDateIdx } from "./utils-feature-detection";

/*********************************************************************************************************
 * - Prepare data
 *********************************************************************************************************/

let allData; // all parameters data
let peaksByRegion;

/*
 * Load data
 */
export async function loadData(): Promise<void> {
  allData = {};

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

  // prettier-ignore
  console.log("utils-story-5a: loadData: csv = ", csv);
  const parameters = csv.columns.slice(0);
  // prettier-ignore
  console.log("utils-story-5a: loadData: parameters = ", parameters);

  csv.forEach((row) => {
    parameters.forEach((parameter) => {
      if (!allData[parameter]) { 
        allData[parameter] = [];
      } else if (allData[parameter].find(({ y }) => y === +row[parameter])) {
         console.log("skip"); 
      } else {
        allData[parameter].push({
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

  console.log("utils-story-5a: loadData: dataByParameters = ", allData);
}

export function getParameters() {
  return ["layers", "channels", "kernel_size", "samples_per_class"];
}

/*********************************************************************************************************
 * Filter/select parameter
 *********************************************************************************************************/

let selectedData = []; // selected parameter data
let selectedParameter;
let annotations: IGraphAnnotationWrapper[];

export function filterData(_parameter: string) {
  selectedParameter = _parameter;
  selectedData = allData[selectedParameter].sort(function (a, b) {
    return a.date - b.date;
  });
  // prettier-ignore
  console.log("utils-story-5: filterData: selectedData = ", selectedData);

  calculateAnnotations();
}

function calculateAnnotations() {
  annotations = [];

  for (const d of selectedData) {
    console.log(d);

    //
    // feature 1:
    // a test run -->
    // action 1a:
    // display accuracy in number: possible implementation: display "y% [x%]" in a colour text (e.g.,
    // cyan), where y% is the testing accuracy, and x% is the training accuracy.
    //

    // prettier-ignore
    const msg = `Accuracy: ${d?.mean_test_accuracy?.toFixed(2)}% [${d?.mean_training_accuracy?.toFixed(2)}%]`;
    annotations.push(writeText(msg, d.date, selectedData, false));

    // true: show red circle
  }

  // Sort annotations and set annotations starts to the end of the previous annotation
  annotations.sort((a1, a2) => a1.end - a2.end);
  annotations.push({ end: selectedData.length - 1 });
  annotations.slice(1).forEach((anno, i) => (anno.start = annotations[i].end));

  // prettier-ignore
  console.log("utils-story-1: calculateAnnotations: annotations = ", annotations);
}

function writeText(text, date, data, showRedCircle = false) {
  // Find idx of event in data and set location of the annotation in opposite half of graph
  const idx = findDateIdx(date, data);

  const target = data[idx];

  const anno = new GraphAnnotation()
    .title(date.toLocaleDateString())
    .label(text)
    .backgroundColor("#EEE")
    .wrap(500);

  // @ts-expect-error -- investigate
  anno.left = idx < data.length / 2;
  anno.unscaledTarget = [target.date, target.y];

  if (showRedCircle) {
    anno.circleHighlight();
  }

  return {
    end: idx,
    annotation: anno,
    fadeout: true,
  } as IGraphAnnotationWrapper;
}

/*********************************************************************************************************
 * - Create or init TimeSeries.
 * - Animate when button is clicked.
 *********************************************************************************************************/

let ts;

export function createPlot(selector: string) {
  console.log("utils-story-5: createPlot: selector = ", selector);

  ts = new TimeSeries()
    .selector(selector)
    .data1(selectedData)
    .color1("#d3d3d3")
    .title(`Basic story of ${selectedParameter}`)
    .yLabel(`${selectedParameter}`)
    .ticks(30)
    .showPoints1()
    .pointsColor1("#A9A9A9")
    // .plot(); // static plot

    .annotations(annotations)
    .annoTop();
  // showEventLines()
}

export function animatePlot(counter: number) {
  // prettier-ignore
  console.log("utils-story-5: animatePlot: counter: ", counter);
  ts.animate(counter);
}
