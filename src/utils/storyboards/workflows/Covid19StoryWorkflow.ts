import { Workflow } from "./Workflow";
import { readCSVFile } from "../../../services/data";
import { NumericalFeature } from "../processing/NumericalFeature";
import { CategoricalFeature } from "../processing/CategoricalFeature";
import { TimeseriesType } from "src/types/TimeseriesType";
import { featureActionTable1 } from "src/mock/covid19-feature-action";
import { rankByHeight, searchPeaks } from "../processing/feature-search";
import { Peak } from "../processing/Peak";
import { CategoricalFeatureType } from "src/types/CategoricalFeatureType";

export class Covid19StoryWorkflow extends Workflow {
  private _nts: NumericalFeature[];
  private _cts: CategoricalFeature[];

  constructor() {
    super();
  }

  protected async load() {
    const CSV = "/static/storyboards/newCasesByPublishDateRollingSum.csv";
    const csv: any[] = await readCSVFile(CSV);

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

    console.log("load: data = ", this.data);
  }

  protected execute() {
    if (!this.key) return;

    this.nts();
    this.cts();

    console.log("execute: ranked nts = ", this._nts);
    console.log("execute: ranked cts = ", this._cts);
  }

  private nts() {
    const nts: Peak[] = searchPeaks(this.data, "Cases/day");
    rankByHeight(nts);
  }

  private cts() {
    const a = new CategoricalFeature(
      new Date("2020-03-24"),
      "Start of First Lockdown.",
      CategoricalFeatureType.LOCKDOWN_START,
      5,
    );

    const b = new CategoricalFeature(
      new Date("2021-01-05"),
      "Start of Second Lockdown.",
      CategoricalFeatureType.LOCKDOWN_END,
      3,
    );

    const c = new CategoricalFeature(
      new Date("2020-05-28"),
      "End of First Lockdown.",
      CategoricalFeatureType.LOCKDOWN_END,
      5,
    );

    this._cts = [a, b, c];
  }

  protected translate() {
    // prettier-ignore
    featureActionTable1.forEach((d, _) => {
      console.log("Workflow:translate: FA = ", d);
    

    });
  }
}
