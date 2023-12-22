import { Workflow } from "./Workflow";
import { readCSVFile } from "../../../services/data";
import { createCTS, createNTS } from "../processing";
import { TimeseriesType } from "../TimeseriesType";
import { NumericalFeature } from "../NumericalFeature";
import { CategoricalFeature } from "../CategoricalFeature";

export class Covid19StoryWorkflow extends Workflow {
  private nts: NumericalFeature[];
  private cts: CategoricalFeature[];

  constructor() {
    super();
  }

  protected async load() {
    const DATA = "/static/storyboards/newCasesByPublishDateRollingSum.csv";
    const csv: any[] = await readCSVFile(DATA);

    csv.forEach((row) => {
      const region = row.areaName;
      const date = new Date(row.date);
      const cases = +row.newCasesByPublishDateRollingSum;

      if (!this.data[region]) {
        this.data[region] = [];
      }

      this.data[region].push({ date: date, y: cases });
    });

    for (const region in this.data) {
      this.data[region].sort(
        (e1: TimeseriesType, e2: TimeseriesType) =>
          e1.date.getTime() - e2.date.getTime(),
      );
    }

    console.log("load: data = ", this.data);
  }

  protected execute() {
    if (!this.key) return;

    this.nts = createNTS(this.data[this.key], "Cases/day");
    this.cts = createCTS();

    console.log("execute: ranked nts = ", this.nts);
    console.log("execute: ranked cts = ", this.cts);
  }
}
