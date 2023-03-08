import { readCSVFile } from "./utils-data";
import { GraphAnnotation, IGraphAnnotationW } from "./GraphAnnotation_new";
import { TimeSeries } from "./TimeSeries_new";
import { findDateIdx } from "./utils-feature-detection";
import { AnimationType } from "src/models/ITimeSeriesData";
import { MirroredBarChart } from "./MirroredBarChart";

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
let graphAnnotationWs: IGraphAnnotationW[];

export function filterData(_parameter: string) {
  selectedParameter = _parameter;
  selectedData = allData[selectedParameter].sort(function (a, b) {
    return a.date - b.date;
  });
  // prettier-ignore
  console.log("utils-story-5: filterData: selectedData = ", selectedData);

  calculateAnnotationWs();
}

function calculateAnnotationWs() {
  graphAnnotationWs = [];

  // Find index of highest attr (e.g., highest testing accuracy)
  const indexOfMax = (arr, attr) => {
    const max = Math.max(...arr.map((d) => d[attr]));
    return arr.findIndex((d) => d[attr] === max);
  };
  const maxIdx = indexOfMax(selectedData, "mean_test_accuracy");

  console.log("utils-story-5: calculateAnnotationWs: maxIdx = ", maxIdx);

  selectedData.forEach((d, idx) => {
    // feature 3:
    // highest testing accuracy (except the first run) -->
    // action 3:
    // message box, "On <time date>, a newly-trained model attended the best results so far with testing accuracy: y% and training accuracy is x%."
    // <Stop to allow reading>
    if (idx === maxIdx) {
      // prettier-ignore
      const msg =  `On ${d?.date?.toLocaleDateString()}, a newly-trained model achieved the best results so far 
      </br> with testing accuracy ${d?.mean_test_accuracy?.toFixed(2)}% and training accuracy ${d?.mean_training_accuracy?.toFixed(2)}%.`
      graphAnnotationWs.push(writeText(msg, d.date, selectedData, true));
    }

    // feature 2:
    // first test run -->
    // action 2:
    // possible implementation: display more detailed sentence in a  message box, e.g., "On <time-date>, a newly-trained model
    // resulted in testing accuracy of y% and training accuracy of x%,  denoted as y% [x%]."
    // <Stop to allow reading>
    else if (idx === 0) {
      // prettier-ignore
      const msg =  `On ${d?.date?.toLocaleDateString()}, a newly-trained model resulted in 
      <br> testing accuracy of ${d?.mean_test_accuracy?.toFixed(2)}% and training accuracy of ${d?.mean_training_accuracy?.toFixed(2)}%, denoted as ${d?.mean_test_accuracy?.toFixed(2)}% [${d?.mean_training_accuracy?.toFixed(2)}%].`
      graphAnnotationWs.push(writeText(msg, d.date, selectedData, true));
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
      graphAnnotationWs.push(writeText(msg, d.date, selectedData, false));

      // action 1b:
      // display the dot as a colour dot (e.g., dark orange), change all already-
      // displayed dots in the same parameters (except the chosen parameter, e.g., channel)
      // to the same colour cyan. Meanwhile change all other dots to dark grey.
      // TODO
    }
  });

  // Sort annotations
  graphAnnotationWs.sort((a1, a2) => a1.current - a2.current);
  graphAnnotationWs.push({ current: selectedData.length - 1 });
  // Set annotations starts to the previous annotation's end/current
  graphAnnotationWs
    .slice(1)
    .forEach(
      (d: IGraphAnnotationW, i) => (d.previous = graphAnnotationWs[i].current),
    );

  // prettier-ignore
  console.log("utils-story-5: calculateAnnotationWs: graphAnnotationWs = ", graphAnnotationWs);
}

function writeText(text, date, data, showRedCircle = false): IGraphAnnotationW {
  // Find idx of event in data and set location of the annotation in opposite half of graph
  const idx = findDateIdx(date, data);

  const graphAnno = new GraphAnnotation()
    .title(date.toLocaleDateString())
    .label(text)
    .backgroundColor("#EEEEEE")
    .color("Grey") // TODO: separately set color of connector, title, ...
    .labelColor("Cyan")
    .wrap(500);

  const target = data[idx];
  graphAnno.unscaledTarget = [target.date, target.y];

  if (showRedCircle) {
    graphAnno.circleHighlight();
  }

  return {
    current: idx,
    graphAnnotation: graphAnno,
    fadeout: true,
  } as IGraphAnnotationW;
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
    .pointsColor1("#696969")
    // .plot(); // static plot
    .graphAnnotations(graphAnnotationWs)
    .annoTop()
    .showEventLines();

  // ts = new MirroredBarChart()
  //   .selector("#chartId1")
  //   .data1(selectedData)
  //   .color1("#d3d3d3")
  //   .title(`Basic story of ${selectedParameter}`)
  //   .yLabel(`${selectedParameter}`)
  //   .ticks(30)
  //   .plot(); // static plot
}

export function animatePlot(animationType: AnimationType) {
  // prettier-ignore
  console.log("utils-story-5: animatePlot: animationType = ", animationType);
  ts.animate(animationType);
}
