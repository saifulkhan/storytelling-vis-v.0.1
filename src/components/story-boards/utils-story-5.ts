import { readCSVFile } from "./utils-data";
import { findDateIdx } from "./utils-feature-detection";
import { AnimationType } from "src/models/AnimationType";
import { MirroredBarChart } from "./MirroredBarChart";
import { TimeSeries } from "./TimeSeries_new";
import { GraphAnnotation, LinePlotAnnotation } from "./GraphAnnotation_new";
import { Color } from "./Colors";
import {
  DotColor,
  TextColor,
  TimeSeriesFeatureType,
} from "./FeatureAndColorMap";

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
    //
    // Feature - maximum accuracy
    //
    if (idx === maxIdx) {
      // prettier-ignore
      const msg =  `A newly-trained model achieved the best testing accuracy ${Math.round(d?.mean_test_accuracy * 100)}% [${Math.round(d?.mean_training_accuracy * 100)}%].`
      lpAnnotations.push(
        writeText(msg, d.date, selectedData, TimeSeriesFeatureType.MAX, true),
      );
    }
    //
    // Feature - first test run
    //
    else if (idx === 0) {
      // prettier-ignore
      const msg =  `A newly-trained model achieved testing accuracy of ${Math.round(d?.mean_test_accuracy * 100)}% and training accuracy of ${Math.round(d?.mean_training_accuracy * 100)}%, denoted as ${Math.round(d?.mean_test_accuracy * 100)}% [${Math.round(d?.mean_training_accuracy * 100)}%].`
      lpAnnotations.push(
        writeText(
          msg,
          d.date,
          selectedData,
          TimeSeriesFeatureType.CURRENT,
          true,
        ),
      );
    }
    //
    // Feature - current
    //
    else {
      // prettier-ignore
      const msg = `Accuracy: ${Math.round(d?.mean_test_accuracy * 100)}% [${Math.round(d?.mean_training_accuracy * 100)}%]`;
      lpAnnotations.push(
        writeText(
          msg,
          d.date,
          selectedData,
          TimeSeriesFeatureType.CURRENT,
          false,
        ),
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
  // labelColor = HIGHLIGHT_DEFAULT_COLOR,
  featureType: TimeSeriesFeatureType,
  showRedCircle = false,
): LinePlotAnnotation {
  // Find idx of event in data and set location of the annotation in opposite half of graph
  const idx = findDateIdx(date, data);

  const graphAnnotation = new GraphAnnotation()
    .title(date.toLocaleDateString("en-GB"))
    .label(text)
    .backgroundColor(Color.WhiteGrey)
    .titleColor(Color.Grey)
    .labelColor(TextColor[featureType])
    .connectorColor(Color.LightGrey2)
    .fontSize("13px")
    .wrap(500);

  if (showRedCircle) {
    graphAnnotation.circleHighlight(DotColor[featureType], 10);
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

const LINE1_STROKE_WIDTH = 1;

export function createPlot(selector1: string, selector2: string) {
  // prettier-ignore
  console.log("utils-story-5: createPlot: selector1 = ", selector1, ", selector2 = ", selector2);

  ts = new TimeSeries()
    .selector(selector1, 200, 850, {
      top: 10,
      right: 20,
      bottom: 20,
      left: 50,
    })
    .data1(selectedData)
    .color1(Color.LightGrey1)
    .strokeWidth1(LINE1_STROKE_WIDTH)
    .title("")
    .yLabel(`${selectedParameter}`)
    .ticks(10)
    .showPoints1()
    .pointsColor1(Color.DarkGrey)
    // .plot(); // static plot // debug
    .annotations(lpAnnotations)
    .annoTop()
    .showEventLines();

  bc = new MirroredBarChart()
    .selector(selector2, 200, 850, {
      top: 10,
      right: 20,
      bottom: 20,
      left: 50,
    })
    .data1(selectedData)
    .color1(Color.CornflowerBlue)
    .color2(Color.DarkGrey)
    .title("")
    .yLabel1(`accuracy`)
    .yLabel2(`${selectedParameter}`)
    .ticks(10)
    // .plot(); // static plot // debug
    .annotations(lpAnnotations);
}

export function animatePlot(animationType: AnimationType) {
  // prettier-ignore
  console.log("utils-story-5: animatePlot: animationType = ", animationType);
  ts.animate(animationType);
  bc.animate(animationType);
}
