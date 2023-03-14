import { readCSVFile } from "./utils-data";
import { SemanticEvent } from "./SemanticEvent";
import { detectFeatures } from "./utils-feature-detection";
import {
  combineBounds,
  eventsToGaussian,
  findDateIdx,
  maxBounds,
  peakSegment,
  splitDataAndEvents,
} from "./utils-aggregation-segmentation";

import { GraphAnnotation, LinePlotAnnotation } from "./GraphAnnotation_new";
import { DataEvent } from "./DataEvent";
import { TimeSeries } from "./TimeSeries_new";
import { linRegGrad } from "./utils-data-processing";
import { AnimationType } from "src/models/ITimeSeriesData";

/*********************************************************************************************************
 * - Prepare data
 *********************************************************************************************************/

let dailyCasesByRegion = {};
let semanticEvents = [];
let peaksByRegion = {};
let gaussByRegion = {};

/*
 * Load data
 */
export async function loadData(): Promise<void> {
  await prepareDailyCasesByRegion();
  prepareSemanticEvents();
  preparePeaksByRegion();
  prepareGaussByRegion();
}

/*
 * Return all area/region names sorted.
 */
export function getRegions(): string[] {
  return Object.keys(dailyCasesByRegion).sort();
}

async function prepareDailyCasesByRegion() {
  dailyCasesByRegion = {};

  const csv: any[] = await readCSVFile(
    "/static/story-boards/newCasesByPublishDateRollingSum.csv",
  );

  csv.forEach((row) => {
    const region = row.areaName;
    const date = new Date(row.date);
    const cases = +row.newCasesByPublishDateRollingSum;

    if (!dailyCasesByRegion[region]) dailyCasesByRegion[region] = [];

    dailyCasesByRegion[region].push({ date: date, y: cases });
  });

  for (const region in dailyCasesByRegion) {
    dailyCasesByRegion[region].sort((e1, e2) => e1.date - e2.date);
  }

  // prettier-ignore
  console.log("utils-story-1: prepareDailyCasesByRegion: dailyCasesByRegion = ", dailyCasesByRegion);
}

/**
 * Semantic or calender events
 * TODO: This is a bit of a hack. We should construct it from the data specified in a csv file.
 */

function prepareSemanticEvents() {
  semanticEvents = [];
  // We need to construct Calendar Data

  // Lock-down events
  const lockdownStart1 = new SemanticEvent(new Date("2020-03-24"))
    .setType(SemanticEvent.TYPES.LOCKDOWN_START)
    .setDescription("Start of First Lockdown.");
  const lockdownStart2 = new SemanticEvent(new Date("2021-01-05"))
    .setType(SemanticEvent.TYPES.LOCKDOWN_END)
    .setDescription("Start of Second Lockdown.");
  const lockdownEnd1 = new SemanticEvent(new Date("2020-05-28"))
    .setType(SemanticEvent.TYPES.LOCKDOWN_START)
    .setDescription("End of First Lockdown.");
  const lockdownEnd2 = new SemanticEvent(new Date("2021-04-01"))
    .setType(SemanticEvent.TYPES.LOCKDOWN_END)
    .setDescription("End of Second Lockdown.");

  // Vaccine Events
  const pfizer1 = new SemanticEvent(new Date("2020-12-08"))
    .setType(SemanticEvent.TYPES.VACCINE)
    .setDescription("UK begins rollout of Pfizer Vaccine.");
  const astra1 = new SemanticEvent(new Date("2021-01-04"))
    .setType(SemanticEvent.TYPES.VACCINE)
    .setDescription(
      "Astrazeneca Vaccine approved and begins being administered.",
    );
  const moderna1 = new SemanticEvent(new Date("2021-04-13"))
    .setType(SemanticEvent.TYPES.VACCINE)
    .setDescription("Moderna Vaccine rollout begins in the UK.");
  const booster = new SemanticEvent(new Date("2021-09-16"))
    .setType(SemanticEvent.TYPES.VACCINE)
    .setDescription("Booster campaign in the UK starts.");

  // Create an array of semantic events and return
  semanticEvents = [
    lockdownStart1,
    lockdownEnd1,
    lockdownStart2,
    lockdownEnd2,
    pfizer1,
    astra1,
    moderna1,
    booster,
  ];

  const ranking = {};
  ranking[SemanticEvent.TYPES.LOCKDOWN_START] = 5;
  ranking[SemanticEvent.TYPES.VACCINE] = 4;
  ranking[SemanticEvent.TYPES.LOCKDOWN_END] = 3;

  semanticEvents.forEach((e) => e.setRank(ranking[e.type]));

  // prettier-ignore
  console.log("utils-story-1: prepareSemanticEvents: ranked semanticEvents = ", semanticEvents);
}

function preparePeaksByRegion() {
  peaksByRegion = {};
  for (const region in dailyCasesByRegion) {
    peaksByRegion[region] = detectFeatures(dailyCasesByRegion[region], {
      peaks: true,
      metric: "Daily Cases",
    });
  }

  // prettier-ignore
  console.log("utils-story-1: preparePeaksByRegion: peaksByRegion = ", peaksByRegion);

  const rankPeaks = (peaks) => {
    const sorted = [...peaks].sort((p1, p2) => p1.height - p2.height);
    const nPeaks = peaks.length;
    const fifth = nPeaks / 5;

    sorted.forEach((p, i) => p.setRank(1 + Math.floor(i / fifth)));
  };

  // for each region we apply the ranking function to the peak events
  for (const region in peaksByRegion) {
    rankPeaks(peaksByRegion[region]);
  }

  //prettier-ignore
  console.log("utils-story-1: preparePeaksByRegion: ranked peaksByRegion = ", peaksByRegion);
}

function prepareGaussByRegion() {
  gaussByRegion = {};

  for (const region in peaksByRegion) {
    const peaks = peaksByRegion[region];
    const dailyCases = dailyCasesByRegion[region];

    // Calculate gaussian time series for peaks
    const peaksGauss = eventsToGaussian(peaks, dailyCases);
    const peaksBounds = maxBounds(peaksGauss);

    // console.log("createGaussByRegion: peaksBounds = ", peaksBounds);

    // Calculate gaussian time series for calendar events
    const calGauss = eventsToGaussian(semanticEvents, dailyCases);
    const calBounds = maxBounds(calGauss);

    // Combine gaussian time series
    const combGauss = combineBounds([peaksBounds, calBounds]);
    gaussByRegion[region] = combGauss;
  }

  // prettier-ignore
  console.log("utils-story-1: prepareGaussByRegion: gaussByRegion = ", gaussByRegion);
}

/*********************************************************************************************************
 * - Filter/select region or area
 * - Segmentation value
 *********************************************************************************************************/

let splitsByRegion = {};
let segment: number;
let region: string;
let selectedRegionData;
let annotations: LinePlotAnnotation[];

export function filterData(_region: string, _segment: number) {
  selectedRegionData = [];
  console.log("utils-story-1: filterData: region =  ", region);

  region = _region;
  segment = _segment;

  segmentData();

  selectedRegionData = dailyCasesByRegion[region];
  // prettier-ignore
  console.log("utils-story-1: filterData: selectedRegionData", selectedRegionData);

  calculateAnnotations();
}

function segmentData() {
  splitsByRegion = {};

  for (const region in peaksByRegion) {
    const dailyCases = dailyCasesByRegion[region];
    splitsByRegion[region] = peakSegment(
      gaussByRegion[region],
      dailyCases,
    ).slice(0, segment - 1);
  }

  // prettier-ignore
  console.log("utils-story-1: segmentData: splitsByRegion = ", splitsByRegion);
}

/*********************************************************************************************************
 * Create annotation objects
 *********************************************************************************************************/

const HIGHLIGHT_DEFAULT_COLOR = "#474440",
  TITLE_COLOR = "#696969",
  BACKGROUND_COLOR = "#F5F5F5";

const CIRCLE_HIGHLIGHT_COLOR = "#F96F4C",
  LINE1_STROKE_WIDTH = 2.0,
  LINE1_COLOR = "#696969";

function calculateAnnotations() {
  annotations = [];

  // We now combine the event arrays and segment them based on our splits
  const peaks = peaksByRegion[region];
  // prettier-ignore
  console.log("utils-story-1: calculateAnnotations: peaksByRegion[", region, "]", peaks);
  const events = peaks.concat(semanticEvents);
  const splits = splitsByRegion[region].sort((s1, s2) => s1.date - s2.date);

  // Segment data and events according to the splits
  const dataEventsBySegment = splitDataAndEvents(
    events,
    splits,
    selectedRegionData,
  );

  // prettier-ignore
  console.log("utils-story-1: calculateAnnotations: dataEventsBySegment", dataEventsBySegment);

  // Loop over all segments and apply feature-action rules
  // let annotations = [{ start: 0, end: 0 }];
  let currSeg = 0;
  let currData, firstDate, lastDate;
  for (; currSeg < segment; currSeg++) {
    // Get segment data based on segment number
    currData = dataEventsBySegment[currSeg];
    firstDate = currData[0].date;
    lastDate = currData[currData.length - 1].date;

    // Apply different rules for first, middle and last segment
    if (currSeg == 0) {
      //
      //   ------- First Segment Rules -------
      // ------- Rules based on entire segment -------
      //

      // Add annotation for positive line of best fit
      const slope = linRegGrad(currData.map((d) => d.y)) as number;
      const posGrad = slope > 0;
      if (posGrad)
        annotations.push(
          writeText(
            "The number of cases continues to grow.",
            firstDate,
            selectedRegionData,
          ),
        );

      // Add annotation based on gradient of line of best fit
      let gradText = "";
      if (Math.abs(slope) >= 0.25) {
        // Steep case
        gradText =
          `By ${lastDate.toLocaleDateString()}, the number of cases ` +
          (posGrad
            ? "continued to climb higher."
            : "continued to come down noticeably.");
        annotations.push(writeText(gradText, lastDate, selectedRegionData));
      } else if (Math.abs(slope) >= 0.05) {
        // Shallow case
        gradText =
          `By ${lastDate.toLocaleDateString()}, the number of cases continued to ` +
          (posGrad ? "increase." : "decrease.");
        annotations.push(writeText(gradText, lastDate, selectedRegionData));
      }

      //
      //  ------- Rules based on datapoints in segment -------
      //

      // Set up variables for tracking highest peak and first non-zero value
      let highestPeak;
      let foundNonZero = false;
      currData.forEach((d) => {
        // Add annotation for the first non-zero value
        if (!foundNonZero && d.y > 0) {
          const nonZeroText = `On ${d.date.toLocaleDateString()}, ${region} recorded its first COVID-19 case.`;
          annotations.push(writeText(nonZeroText, d.date, selectedRegionData));
          foundNonZero = true;
        }

        d.events.forEach((e) => {
          // Add annotation for semantic events that are rank > 3
          if (e.rank > 3 && e instanceof SemanticEvent) {
            annotations.push(
              // @ts-expect-error -- fix accessing protected _date
              writeText(
                e.description,
                e._date,
                selectedRegionData,
                HIGHLIGHT_DEFAULT_COLOR,
                true,
              ),
            );
          }

          // Find tallest peak that is ranked > 3
          if (e.rank > 3 && e.type == DataEvent.TYPES.PEAK) {
            highestPeak =
              highestPeak && highestPeak.height > e.height ? highestPeak : e;
          }
        });
      });

      // Add annotation if we have a tall enough peak
      if (highestPeak) {
        const peakText = `By ${highestPeak.date}, the number of cases reached ${highestPeak.height}.`;
        annotations.push(
          writeText(peakText, highestPeak._date, selectedRegionData),
        );
      }
    } else if (currSeg < segment - 1) {
      //
      //  ------- Middle Segments Rules -------
      //  ------- Rules based on datapoints in segment -------
      //
      currData.forEach((d) => {
        d.events.forEach((e) => {
          // Add annotation for semantic events that are rank > 3
          if (e.rank > 3 && e instanceof SemanticEvent) {
            annotations.push(
              // @ts-expect-error -- fix accessing protected _date
              writeText(
                e.description,
                e._date,
                selectedRegionData,
                HIGHLIGHT_DEFAULT_COLOR,
                true,
              ),
            );
          }

          // Add annotation for peak events that are rank > 3
          if (e.rank > 3 && e.type == DataEvent.TYPES.PEAK) {
            const peakText = `By ${e.date}, the number of cases peaks at ${e.height}.`;
            annotations.push(
              writeText(
                peakText,
                e._date,
                selectedRegionData,
                HIGHLIGHT_DEFAULT_COLOR,
                true,
              ),
            );
          }
        });
      });
    } else {
      //
      //  ------- Last Segment Rules -------
      // ------- Rules based entire segment -------
      //

      // Add annotation based on gradient of line of best fit
      let gradText = "";
      const slope = linRegGrad(currData.map((d) => d.y));
      if (slope >= 0.25) {
        // Steep case
        gradText = `By ${lastDate.toLocaleDateString()}, the number of cases continued to climb higher.
                      Let us all make a great effort to help bring the number down. Be safe, and support the NHS.`;
      } else if (slope >= 0.05) {
        // Shallow case
        gradText = `By ${lastDate.toLocaleDateString()}, the number of cases continued to increase.
                      Let us continue to help bring the number down. Be safe, and support the NHS.`;
      } else if (slope > -0.05) {
        // Flat case
        const cases = selectedRegionData[selectedRegionData.length - 1].y;

        // Add annotation based on final case number
        if (cases >= 200) {
          gradText = `The number of cases remains very high. Let us be safe, and support the NHS.`;
        } else if (cases >= 50) {
          gradText = `The number of cases remains noticeable. Let us be safe and support the NHS.`;
        } else {
          gradText = `The number of cases remains low. We should continue to be vigilant.`;
        }
      } else if (slope > -0.25) {
        // Negative shallow case
        gradText = `By ${lastDate.toLocaleDateString()}, the number of cases continued to decrease.
                      The trend is encouraging. Let us be vigilant, and support the NHS.`;
      } else {
        // Negative steep case
        gradText = `By ${lastDate.toLocaleDateString()}, the number of cases continued to come down noticeably.
                      We should continue to be vigilant.`;
      }
      annotations.push(writeText(gradText, lastDate, selectedRegionData));

      //
      //------- Rules based on datapoints in segement -------
      //
      currData.forEach((d) => {
        d.events.forEach((e) => {
          // Add annotation for semantic events that are rank > 3
          if (e.rank > 3 && e instanceof SemanticEvent) {
            annotations.push(
              // @ts-expect-error -- fix accessing protected _date
              writeText(
                e.description,
                e._date,
                selectedRegionData,
                HIGHLIGHT_DEFAULT_COLOR,
                true,
              ),
            );
          }

          // Add annotation for peak events that are rank > 3
          if (e.rank > 3 && e.type == DataEvent.TYPES.PEAK) {
            const peakText = `By ${e.date}, the number of cases peaks at ${e.height}.`;
            annotations.push(
              writeText(
                peakText,
                e._date,
                selectedRegionData,
                HIGHLIGHT_DEFAULT_COLOR,
                true,
              ),
            );
          }
        });
      });
    }
  }

  // Sort annotations and set annotations starts to the end of the previous annotation
  annotations.sort((a1, a2) => a1.current - a2.current);
  annotations.push({ current: selectedRegionData.length - 1 });
  annotations
    .slice(1)
    .forEach(
      (anno: LinePlotAnnotation, i) => (anno.previous = annotations[i].current),
    );

  // prettier-ignore
  console.log("utils-story-1: calculateAnnotations: annotations = ", annotations);
}

function writeText(
  text,
  date,
  data,
  labelColor = HIGHLIGHT_DEFAULT_COLOR,
  showRedCircle = false,
) {
  // Find idx of event in data and set location of the annotation in opposite half of graph
  const idx = findDateIdx(date, data);

  const anno = new GraphAnnotation()
    .title(date.toLocaleDateString())
    .label(text)
    .backgroundColor(BACKGROUND_COLOR)
    .titleColor(TITLE_COLOR)
    .labelColor(labelColor)
    .wrap(500);

  if (showRedCircle) {
    anno.circleHighlight(CIRCLE_HIGHLIGHT_COLOR, 10);
  }

  const target = data[idx];
  anno.unscaledTarget = [target.date, target.y];

  return {
    current: idx,
    graphAnnotation: anno,
    fadeout: true,
  } as LinePlotAnnotation;
}

/*********************************************************************************************************
 * - Create or init TimeSeries.
 * - Animate when button is clicked.
 *********************************************************************************************************/

let ts;

export function createTimeSeries(selector: string) {
  console.log("createTimeSeries: selector = ", selector);
  console.log("createTimeSeries: annotations = ", annotations);

  ts = new TimeSeries()
    .selector(selector, 400, 1200, { top: 50, right: 50, bottom: 50, left: 50 })
    .data1(selectedRegionData)
    .color1(LINE1_COLOR)
    .strokeWidth1(LINE1_STROKE_WIDTH)
    .title(`Basic story of COVID-19 in ${region}`)
    .yLabel("Cases per Day")
    .ticks(30)
    // .plot(); // static plot
    .annotations(annotations)
    .annoTop()
    .showEventLines();
}

export function animateTimeSeries(animationType: AnimationType) {
  // prettier-ignore
  console.log("animateTimeSeries: animationType: ", animationType);
  ts.animate(animationType);
}
