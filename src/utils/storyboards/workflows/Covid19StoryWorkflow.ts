import { AbstractWorkflow } from "./AbstractWorkflow";
import { readCSVFile } from "../../../services/data";
import { NumericalFeature } from "../feature/NumericalFeature";
import { CategoricalFeature } from "../feature/CategoricalFeature";
import { featureActionTable1 } from "src/mock/covid19-feature-action";
import { LineChart } from "src/components/storyboards/plots/LineChart";
import { TimeseriesDataType } from "../processing/TimeseriesDataType";
import { FeatureActionTableTranslator } from "../processing/FeatureActionTableTranslator";
import { TimeseriesFeatureDetectorProperties } from "../feature/TimeseriesFeatureDetector";
import { findIndexOfDate, findIndicesOfDates } from "../processing/common";
import {
  AbstractAction,
  ActionsType,
} from "src/components/storyboards/actions/AbstractAction";
import { DateActionsMap } from "../processing/FeatureActionMaps";

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

      if (!this._allData[region]) {
        this._allData[region] = [];
      }

      this._allData[region].push({ date: date, y: cases });
    });

    for (const region in this._allData) {
      this._allData[region].sort(
        (d1: TimeseriesDataType, d2: TimeseriesDataType) =>
          d1.date.getTime() - d2.date.getTime(),
      );
    }

    console.log("Covid19StoryWorkflow:load: data = ", this._allData);
  }

  protected create() {
    if (!this._key) return;

    // this.nts = nts(this.data, "Cases/day", WINDOW);
    // this.cts = cts();
    // console.log("execute: ranked nts = ", this.nts);
    // console.log("execute: ranked cts = ", this.cts);

    const dataActionsMap: DateActionsMap = new FeatureActionTableTranslator(
      featureActionTable1,
      this._data,
      {
        metric: "Cases/day",
        window: WINDOW,
      } as TimeseriesFeatureDetectorProperties,
    ).translate();

    // console.log("Covid19StoryWorkflow: dateFeatureMap = ", dateFeatureMap);
    // console.log("Covid19StoryWorkflow: featureActionMap = ", featureActionMap);
    console.log("Covid19StoryWorkflow: dataActionsMap = ", dataActionsMap);

    const dates: Date[] = [...dataActionsMap.keys()];
    dates.sort((d1: Date, d2: Date) => d1.getTime() - d2.getTime());

    const indices = findIndicesOfDates(this._data, dates);
    // prettier-ignore
    console.log("Covid19StoryWorkflow: dates = ", dates,  ", indices = ", indices);

    const plot = new LineChart()
      .data([this._data])
      .chartProperties({})
      .lineProperties()
      .svg(this._svg);

    // static
    // plot.draw();

    let start = 0;

    (async () => {
      try {
        for (const date of dates) {
          // prettier-ignore
          console.log("Covid19StoryWorkflow: index = ", findIndexOfDate(this._data, date));

          const actionsArray: ActionsType[] = dataActionsMap.get(date);
          console.log("Covid19StoryWorkflow: actionsArray = ", actionsArray);

          const end = findIndexOfDate(this._data, date);
          await plot.animate(0, start, end);

          for (const actions of actionsArray) {
            console.log("Covid19StoryWorkflow: actions = ", actions);
            for (const action of actions) {
              console.log("Covid19StoryWorkflow: action = ", action);
              action
                .svg(this._svg)
                .draw()
                .coordinate(...plot.coordinates(0, date));
            }
            await AbstractAction.showAll(actions);
            await AbstractAction.hideAll(actions);
            console.log("actions = ", actions);
          }

          start = end;
        }
        if (start < this._data.length) {
          const res = await plot.animate(0, start, this._data.length);
          console.log("res = ", res);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    })();
  }
}
