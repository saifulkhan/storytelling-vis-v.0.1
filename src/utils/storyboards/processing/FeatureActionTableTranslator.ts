import { TimeseriesDataType } from "./TimeseriesDataType";
import { AbstractFeature } from "../features/AbstractFeature";
import { ActionBuilder } from "./ActionBuilder";
import {
  ActionTableRowType,
  FeatureActionTableRowType as FeatureActionTableRowType,
} from "./FeatureActionTableRowType";
import {
  TimeseriesFeatureDetector,
  TimeseriesFeatureDetectorProperties,
} from "../features/TimeseriesFeatureDetector";
import {
  AbstractAction,
  ActionsOnDateType,
} from "src/components/storyboards/actions/AbstractAction";

export class FeatureActionTableTranslator {
  private _data: TimeseriesDataType[];
  private _table: FeatureActionTableRowType[];
  private _properties: TimeseriesFeatureDetectorProperties;

  constructor(
    table: FeatureActionTableRowType[],
    data: TimeseriesDataType[],
    properties: TimeseriesFeatureDetectorProperties,
  ) {
    this._table = table;
    this._data = data;
    this._properties = properties;
  }

  public translate() {
    const featureDetector = new TimeseriesFeatureDetector(
      this._data,
      this._properties,
    );
    const actionBuilder = new ActionBuilder();

    const actionsOnDate: ActionsOnDateType[] = [];

    this._table.forEach((d: FeatureActionTableRowType) => {
      // prettier-ignore
      console.log("FeatureActionTableTranslator: feature = ", d.feature, ", properties = ", d.properties);
      const features: AbstractFeature[] = featureDetector.detect(
        d.feature,
        d.properties,
      );
      // prettier-ignore
      console.log("FeatureActionTableTranslator: features = ", features);

      const actions: AbstractAction[] = [];

      d.actions.forEach((d1: ActionTableRowType) => {
        // prettier-ignore
        console.log("FeatureActionTableTranslator: action = ", d1.action,  ", properties = ", d1.properties);
        const action = actionBuilder.create(d1.action, d1.properties);
        // prettier-ignore
        console.log("FeatureActionTableTranslator: action = ", action);

        actions.push(action);
      });

      features.forEach((d: AbstractFeature) => {
        actionsOnDate.push({ date: d.date, actions: actions });
      });
    });

    return actionsOnDate.sort((a: ActionsOnDateType, b: ActionsOnDateType) => {
      return a.date - b.date;
    });
  }
}
