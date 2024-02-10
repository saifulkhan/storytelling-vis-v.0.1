import { Workflow } from "./Workflow";
import { readCSVFile } from "../../../services/data";
import { NumericalFeature } from "../features/NumericalFeature";
import { CategoricalFeature } from "../features/CategoricalFeature";
import { featureActionTable1 } from "src/mock/covid19-feature-action";
import { LinePlot } from "src/components/storyboards/plots/LinePlot";
import { TimeseriesDataType } from "../processing/TimeseriesDataType";
import { FeatureActionTableTranslator } from "../processing/FeatureActionTableTranslator";
import {
  AbstractAction,
  ActionsOnDateType,
} from "src/components/storyboards/actions/AbstractAction";
import { ActionEnum } from "src/components/storyboards/actions/ActionEnum";

const WINDOW = 3;

export class Covid19StoryWorkflow extends Workflow {
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

    for (const region in this.data) {
      this._data[region].sort(
        (e1: TimeseriesDataType, e2: TimeseriesDataType) =>
          e1.date.getTime() - e2.date.getTime(),
      );
    }

    // console.log("load: data = ", this._data);
  }

  protected create() {
    if (!this.key) return;

    // this.nts = nts(this.data, "Cases/day", WINDOW);
    // this.cts = cts();
    // console.log("execute: ranked nts = ", this.nts);
    // console.log("execute: ranked cts = ", this.cts);

    const plot = new LinePlot()
      .properties({ showPoints: false })
      .data(this.data)
      .draw(this.svgNode);

    const actionsOnDate = new FeatureActionTableTranslator(
      featureActionTable1,
      this.data,
      {
        metric: "Cases/day",
        window: WINDOW,
      },
    ).translate();

    console.log("Covid19StoryWorkflow: actionsOnDate = ", actionsOnDate);

    actionsOnDate.forEach((d: ActionsOnDateType) => {
      const coordinate = plot.coordinates(d.date);
      // prettier-ignore
      console.log("Covid19StoryWorkflow: date = ", d.date, "coordinate = ", coordinate);
      d.actions.forEach((d1: AbstractAction) => {
        if (d1.type !== ActionEnum.TEXT_BOX) {
          d1.draw(this.svgNode).coordinate(
            coordinate[0],
            coordinate[1],
            coordinate[2],
            coordinate[3],
          );
        }
      });
    });
  }
}
