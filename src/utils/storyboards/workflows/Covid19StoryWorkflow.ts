import { Workflow } from "./Workflow";
import { readCSVFile } from "../../../services/data";
import { NumericalFeature } from "../processing/NumericalFeature";
import { CategoricalFeature } from "../processing/CategoricalFeature";
import { TimeseriesType } from "src/types/TimeseriesType";
import { featureActionTable1 } from "src/mock/covid19-feature-action";
import { FeatureBuilder } from "../processing/FeatureBuilder";
import { cts, nts } from "../processing/feature-search";

const WINDOW = 3;

export class Covid19StoryWorkflow extends Workflow {
  private nts: NumericalFeature[];
  private cts: CategoricalFeature[];

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

    for (const region in this.data) {
      this._data[region].sort(
        (e1: TimeseriesType, e2: TimeseriesType) =>
          e1.date.getTime() - e2.date.getTime(),
      );
    }

    // console.log("load: data = ", this._data);
  }

  protected setup() {
    if (!this.key) return;

    // this.nts = nts(this.data, "Cases/day", WINDOW);
    // this.cts = cts();
    // console.log("execute: ranked nts = ", this.nts);
    // console.log("execute: ranked cts = ", this.cts);

    const featureBuilder = new FeatureBuilder(
      featureActionTable1,
      this.data,
      "Cases/day",
      WINDOW,
    );
    const features = featureBuilder.build();
    console.log("Covid19StoryWorkflow:execute: features = ", features);
  }
}
