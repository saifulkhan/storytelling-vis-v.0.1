import { AbstractWorkflow } from "./AbstractWorkflow";
import { readCSVFile } from "../../../services/data";
import { NumericalFeature } from "../feature/NumericalFeature";
import { CategoricalFeature } from "../feature/CategoricalFeature";
import { featureActionTable1 } from "src/mock/covid19-feature-action";
import { LineChart } from "src/components/storyboards/plots/LineChart";
import { TimeseriesDataType } from "../processing/TimeseriesDataType";
import { FeatureActionTableTranslator } from "../processing/FeatureActionTableTranslator";
import { TimeseriesFeatureDetectorProperties } from "../feature/TimeseriesFeatureDetector";
import { findIndicesOfDates } from "../processing/common";

const WINDOW = 3;

export class Covid19StoryWorkflow extends AbstractWorkflow {
  private _nts: NumericalFeature[];
  private _cts: CategoricalFeature[];

  constructor() {
    super();
  }

  protected async load() {
    const file = "/static/storyboards/newCasesByPublishDateRollingSum.csv";
    const csv: any[] = await readCSVFile(file);
    // console.log("Covid19StoryWorkflow:load: file = ", file, ", csv = ", csv);

    csv.forEach((row) => {
      const region = row.areaName;
      const date = new Date(row.date);
      const cases = +row.newCasesByPublishDateRollingSum;

      if (!this._data[region]) {
        this._data[region] = [];
      }

      this._data[region].push({ date: date, y: cases });
    });

    for (const region in this._data) {
      this._data[region].sort(
        (e1: TimeseriesDataType, e2: TimeseriesDataType) =>
          e1.date.getTime() - e2.date.getTime(),
      );
    }

    console.log("Covid19StoryWorkflow:load: data = ", this._data);
  }

  protected create() {
    if (!this.key) return;

    // this.nts = nts(this.data, "Cases/day", WINDOW);
    // this.cts = cts();
    // console.log("execute: ranked nts = ", this.nts);
    // console.log("execute: ranked cts = ", this.cts);

    const plot = new LineChart()
      .data([this.data])
      .chartProperties({})
      .lineProperties()
      .svg(this._svg);

    plot.draw();
    // plot.animate();

    const [dateFeatureMap, featureActionMap] = new FeatureActionTableTranslator(
      featureActionTable1,
      this.data,
      {
        metric: "Cases/day",
        window: WINDOW,
      } as TimeseriesFeatureDetectorProperties,
    ).translate();

    console.log("Covid19StoryWorkflow: dateFeatureMap = ", dateFeatureMap);
    console.log("Covid19StoryWorkflow: featureActionMap = ", featureActionMap);

    const indices = findIndicesOfDates(this.data, [...dateFeatureMap.keys()]);
    console.log("Covid19StoryWorkflow: indices = ", indices);

    // actionsOnDate.forEach((d: ActionsOnDateType) => {
    //   const coordinate = plot.coordinates(d.date);
    //   // prettier-ignore
    //   // console.log("Covid19StoryWorkflow: date = ", d.date, "coordinate = ", coordinate);
    //   d.actions.forEach((d1: AbstractAction) => {
    //     if (d1.type !== ActionEnum.TEXT_BOX) {
    //       d1.draw(this.svgNode).coordinate(
    //         coordinate[0],
    //         coordinate[1],
    //         coordinate[2],
    //         coordinate[3],
    //       );
    //     }
    //   });
    // });
  }
}
