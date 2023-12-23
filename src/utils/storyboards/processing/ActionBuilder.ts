import { TimeseriesType } from "src/types/TimeseriesType";
import { NumericalFeatureType } from "src/types/NumericalFeatureType";
import { NumericalFeatureParamType } from "src/types/NumericalFeatureParamType";
import { FeatureActionDataType } from "src/types/FeatureActionType";
import { Peak } from "./Peak";
import { Slope } from "./Slope";
import { NumericalFeature } from "./NumericalFeature";
import { searchPeaks, searchSlopes } from "./feature-search";
import { createPredicateFunction as createPredicate } from "./common";

export class ActionBuilder {
  static map: { [key in NumericalFeatureType]: Function } = {
    [NumericalFeatureType.SLOPE]: ActionBuilder.searchSlopes,
    [NumericalFeatureType.PEAK]: ActionBuilder.searchPeaks,
    [NumericalFeatureType.MAX]: undefined,
    [NumericalFeatureType.DEFAULT]: undefined,
    [NumericalFeatureType.CURRENT]: undefined,
    [NumericalFeatureType.LAST]: undefined,
    [NumericalFeatureType.MIN]: undefined,
    [NumericalFeatureType.VALLEY]: undefined,
    [NumericalFeatureType.FALL]: undefined,
    [NumericalFeatureType.RAISE]: undefined,
  };

  static data: TimeseriesType[];
  static table: FeatureActionDataType[];
  static metric: string;
  static window: number;

  constructor(
    table: FeatureActionDataType[],
    data: TimeseriesType[],
    metric,
    window,
  ) {
    ActionBuilder.table = table;
    ActionBuilder.data = data;
    ActionBuilder.window = window;
    ActionBuilder.metric = metric;
  }

  public build(): NumericalFeature[] {
    const features: NumericalFeature[] = [];
    ActionBuilder.table.forEach((d: FeatureActionDataType, _) => {
      const feature = ActionBuilder.map[d.feature](d.featureParams);
      console.log("FeatureSearch:execute: FA = ", d.feature);
      console.log("FeatureSearch:execute: FA = ", d.featureParams);
      // prettier-ignore
      console.log("FeatureSearch:execute: feature = ", feature);
      features.push(feature);
    });

    return features;
  }

  private static searchPeaks(params: Map<string, string | number>): Peak[] {
    const peaks = searchPeaks(
      ActionBuilder.data,
      ActionBuilder.metric,
      ActionBuilder.window,
    );

    return peaks;
  }

  private static searchSlopes(params: Map<string, string | number>): Slope[] {
    let slopes = searchSlopes(ActionBuilder.data, ActionBuilder.window);
    // console.log("slopes = ", slopes);
    // console.log("params = ", params);

    for (const [key, value] of Object.entries(params)) {
      const predicateFunction = ActionBuilder.translateParams(
        key as NumericalFeatureParamType,
        value,
        "slope",
      );
      slopes = slopes.filter(predicateFunction);
      // console.log(`key = ${key}, value = ${value}, slopes = `, slopes);
    }
    return slopes;
  }

  private static translateParams(
    key: NumericalFeatureParamType,
    value: number | string,
    attr: string,
  ): Function {
    switch (key) {
      case NumericalFeatureParamType.EQ:
        return createPredicate(`obj.${attr} == ${value}`);
      case NumericalFeatureParamType.LE:
        return createPredicate(`obj.${attr} <= ${value}`);
      case NumericalFeatureParamType.GE:
        return createPredicate(`obj.${attr}>= ${value}`);
      case NumericalFeatureParamType.LT:
        return createPredicate(`obj.${attr} < ${value}`);
      case NumericalFeatureParamType.GT:
        return createPredicate(`obj.${attr} > ${value}`);
      case NumericalFeatureParamType.NE:
        return createPredicate(`obj.${attr} != ${value}`);
    }
  }
}
