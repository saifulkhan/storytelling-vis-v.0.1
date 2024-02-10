import { Peak, PeakProperties } from "../features/Peak";
import { Slope, SlopeProperties } from "../features/Slope";
import { searchPeaks, searchSlopes } from "../features/feature-search";
import { createPredicate } from "./common";
import { NumericalFeatureEnum } from "../features/NumericalFeatureEnum";
import { FallProperties } from "../features/Fall";
import { RaiseProperties } from "../features/Raise";
import { TimeseriesDataType } from "./TimeseriesDataType";
import { TimeseriesProperties } from "./TimeseriesProperties";
import { AbstractFeature } from "../features/AbstractFeature";

export class FeatureDetector {
  private data: TimeseriesDataType[];
  private timeseriesProcessingProperties: TimeseriesProperties;

  constructor(
    data: TimeseriesDataType[],
    timeseriesProcessingProperties: TimeseriesProperties,
  ) {
    this.data = data;
    this.timeseriesProcessingProperties = timeseriesProcessingProperties;

    // prettier-ignore
    console.log("FeatureDetector: timeseriesProcessingProperties =", this.timeseriesProcessingProperties);
    // prettier-ignore
    console.log("FeatureDetector: data =", this.data);
  }

  public detect(
    feature: NumericalFeatureEnum,
    properties:
      | PeakProperties
      | RaiseProperties
      | SlopeProperties
      | FallProperties,
  ): AbstractFeature[] {
    // prettier-ignore
    console.log("FeatureDetector:detect: timeseriesProcessingProperties =", this.timeseriesProcessingProperties);
    // prettier-ignore
    console.log("FeatureDetector:detect: data =", this.data);

    switch (feature) {
      case NumericalFeatureEnum.SLOPE:
        return this.detectSlopes(properties);
      case NumericalFeatureEnum.PEAK:
        return this.detectPeaks(properties);
      default:
        console.error(`Feature ${feature} is not implemented!`);
    }
  }

  private detectPeaks(properties: PeakProperties): Peak[] {
    // prettier-ignore
    console.log("FeatureDetector:detectPeaks: timeseriesProcessingProperties =", this.timeseriesProcessingProperties);
    // prettier-ignore
    console.log("FeatureDetector:detectPeaks: data =", this.data);

    const peaks = searchPeaks(
      this.data,
      this.timeseriesProcessingProperties.metric,
      this.timeseriesProcessingProperties.window,
    );

    return peaks;
  }

  private detectSlopes(properties: SlopeProperties): Slope[] {
    let slopes = searchSlopes(
      this.data,
      this.timeseriesProcessingProperties.window,
    );
    // console.log("detectSlopes: slopes = ", slopes);
    // console.log("detectSlopes: properties = ", properties);

    for (const [key, value] of Object.entries(properties)) {
      slopes = slopes.filter(this.predicate(key, value, "slope"));
      // prettier-ignore
      // console.log(`detectSlopes: key = ${key}, value = ${value}, slopes = `, slopes);
    }
    return slopes;
  }

  private predicate(
    key: string,
    value: number | string,
    attr: string,
  ): (...args: unknown[]) => unknown {
    switch (key) {
      case "eq":
        return createPredicate(`obj.${attr} == ${value}`);
      case "le":
        return createPredicate(`obj.${attr} <= ${value}`);
      case "ge":
        return createPredicate(`obj.${attr}>= ${value}`);
      case "lt":
        return createPredicate(`obj.${attr} < ${value}`);
      case "gt":
        return createPredicate(`obj.${attr} > ${value}`);
      case "ne":
        return createPredicate(`obj.${attr} != ${value}`);
    }
  }
}
