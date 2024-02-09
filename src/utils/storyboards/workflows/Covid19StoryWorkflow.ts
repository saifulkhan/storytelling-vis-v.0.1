import { Workflow } from "./Workflow";
import { readCSVFile } from "../../../services/data";
import { NumericalFeature } from "../processing/NumericalFeature";
import { CategoricalFeature } from "../processing/CategoricalFeature";
import { TimeseriesDataType } from "src/types/TimeseriesType";
import { featureActionTable1 } from "src/mock/covid19-feature-action";
import { FeatureBuilder } from "../processing/FeatureBuilder";
import { cts, nts } from "../processing/feature-search";
import { LinePlot } from "src/components/storyboards/plots/LinePlot";
import { ActionBuilder } from "../processing/ActionBuilder";

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
        (e1: TimeseriesDataType, e2: TimeseriesDataType) =>
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

    const plot = new LinePlot({ showPoints: false }, this.data);
    plot.drawOn(this.svgNode).draw();

    const featureBuilder = new FeatureBuilder(
      featureActionTable1,
      this.data,
      "Cases/day",
      WINDOW,
    );

    const features = featureBuilder.build();
    console.log("Covid19StoryWorkflow:execute: features = ", features);

    const actionBuilder = new ActionBuilder(featureActionTable1);
    const actions = actionBuilder.build();
    console.log("Covid19StoryWorkflow:execute: actions = ", actions);

    let i = 0;
    for (const f1 of features) {
      for (const feature of f1) {
        const coordinate = plot.coordinates(feature.date);
        console.log(feature.date, coordinate);

        const action = actions[i].draw(this.svgNode);
        action.coordinate(coordinate[2], coordinate[3]);
      }

      i++;
    }
  }
}
