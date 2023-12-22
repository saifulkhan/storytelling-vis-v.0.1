import { CategoricalFeature } from "./CategoricalFeature";
import { CategoricalFeatureType } from "../../../types/CategoricalFeatureType";
import { NumericalFeature } from "./NumericalFeature";
import { Peak } from "./Peak";
import { TimeseriesType } from "../TimeseriesType";
import { searchPeaks } from "./feature-search";

const MAX_RANK = 5;

/*
 * Create numerical timeseries
 */
export function createNTS(
  data: TimeseriesType[],
  metric = "",
): NumericalFeature[] {
  const peaks: Peak[] = searchPeaks(data, metric);
  rankByHeight(peaks);
  return peaks;
}

/*
 * Rank peaks by its height, assign rank between 1 to MAX_RANK
 */
function rankByHeight(peaks: Peak[]) {
  peaks.sort((p1, p2) => p1.height - p2.height);
  const nPeaks = peaks.length;
  // size of each ranking group
  const groupSize = nPeaks / MAX_RANK;
  peaks.forEach((p, i) => (p.rank = 1 + Math.floor(i / groupSize)));
}

/*
 * Create categorical timeseries
 */
export function createCTS(): CategoricalFeature[] {
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

  const cts = [a, b, c];
  return cts;
}
