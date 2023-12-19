import { NumericalFeatureType } from "./NumericalFeatureType";
import { Feature } from "./Feature";

export class NumericalFeature extends Feature {
  protected _metric: string;

  constructor(date, start = undefined, end = undefined, metric = undefined) {
    super(date, start, end);
    this._metric = metric;
    this._type = NumericalFeatureType.DEFAULT;
  }

  set metric(metric) {
    this._metric = metric;
  }

  get metric() {
    return this._metric;
  }
}
