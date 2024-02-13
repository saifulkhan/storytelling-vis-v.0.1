import { TimeseriesDataType } from "./TimeseriesDataType";
import { AbstractFeature } from "../feature/AbstractFeature";
import { ActionBuilder } from "./ActionBuilder";
import {
  ActionTableRowType,
  FeatureActionTableRowType as FeatureActionTableRowType,
} from "./FeatureActionTableRowType";
import {
  TimeseriesFeatureDetector,
  TimeseriesFeatureDetectorProperties,
} from "../feature/TimeseriesFeatureDetector";
import { AbstractAction } from "src/components/storyboards/actions/AbstractAction";
import { DateFeatureMap, FeatureActionMap } from "./FeatureActionMap";

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
    const dateFeatureMap: DateFeatureMap = new Map<Date, AbstractFeature[]>();
    const featureActionMap: FeatureActionMap = new Map<
      AbstractFeature,
      AbstractAction[]
    >();
    const featureDetector = new TimeseriesFeatureDetector(
      this._data,
      this._properties,
    );
    const actionBuilder = new ActionBuilder();

    this._table.forEach((d: FeatureActionTableRowType) => {
      // prettier-ignore
      // console.log("FeatureActionTableTranslator: feature = ", d.feature, ", properties = ", d.properties);
      const features: AbstractFeature[] = featureDetector.detect(
        d.feature,
        d.properties,
      );
      // prettier-ignore
      // console.log("FeatureActionTableTranslator: features = ", features);

      const actions: AbstractAction[] = [];
      d.actions.forEach((d1: ActionTableRowType) => {
        // prettier-ignore
        // console.log("FeatureActionTableTranslator: action = ", d1.action,  ", properties = ", d1.properties);
        const action = actionBuilder.create(d1.action, d1.properties);
        // prettier-ignore
        // console.log("FeatureActionTableTranslator: action = ", action);
        actions.push(action);
      });

      features.forEach((d: AbstractFeature) => {
        this.setOrUpdateValue(dateFeatureMap, d.date, d);
        this.setOrUpdateValue(featureActionMap, d, actions);
      });
    });

    return [dateFeatureMap, featureActionMap];
  }

  // Function to set a value in the map if it doesn't exist, otherwise get the existing value and then set it again
  setOrUpdateValue(map: Map<unknown, unknown>, key: unknown, value: unknown[]) {
    if (map.has(key)) {
      const existingValue = map.get(key);
      existingValue?.push(value);
      map.set(key, existingValue!);
    } else {
      map.set(key, [value]);
    }
  }
}
