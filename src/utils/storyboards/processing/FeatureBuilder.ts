import { TimeseriesType } from "src/types/TimeseriesType";
import { NumericalFeatureType } from "src/types/NumericalFeatureType";
import { FeatureActionDataType } from "src/types/FeatureActionType";
import { Peak } from "./Peak";
import { Slope } from "./Slope";
import { NumericalFeature } from "./NumericalFeature";
import { searchPeaks, searchSlopes } from "./feature-search";
import { createPredicateFunction as createPredicate } from "./common";
import { NumericalFeatureParamType } from "src/types/NumericalFeatureParamType";

export class FeatureBuilder {
  static map: { [key in NumericalFeatureType]: Function } = {
    [NumericalFeatureType.SLOPE]: FeatureBuilder.searchSlopes,
    [NumericalFeatureType.PEAK]: FeatureBuilder.searchPeaks,
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
    FeatureBuilder.table = table;
    FeatureBuilder.data = data;
    FeatureBuilder.window = window;
    FeatureBuilder.metric = metric;
  }

  public build(): NumericalFeature[][] {
    const features: NumericalFeature[][] = [];
    FeatureBuilder.table.forEach((d: FeatureActionDataType, _) => {
      const feature = FeatureBuilder.map[d.feature](d.featureParams);
      console.log("FeatureSearch:execute: feature = ", d.feature);
      console.log("FeatureSearch:execute: featureParams = ", d.featureParams);
      // prettier-ignore
      console.log("FeatureSearch:execute: feature = ", feature);
      features.push(feature);
    });

    return features;
  }

  private static searchPeaks(params: Map<string, string | number>): Peak[] {
    const peaks = searchPeaks(
      FeatureBuilder.data,
      FeatureBuilder.metric,
      FeatureBuilder.window,
    );

    return peaks;
  }

  private static searchSlopes(params: Map<string, string | number>): Slope[] {
    let slopes = searchSlopes(FeatureBuilder.data, FeatureBuilder.window);
    // console.log("slopes = ", slopes);
    // console.log("params = ", params);

    for (const [key, value] of Object.entries(params)) {
      const predicate = FeatureBuilder.translateParams(
        key as NumericalFeatureParamType,
        value,
        "slope",
      );
      slopes = slopes.filter(predicate);
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
