import { Color } from "./Colors";

export enum TimeSeriesFeatureType {
  DEFAULT = "default",
  CURRENT = "current",
  LAST = "last",
  MAX = "max",
  MIN = "min",
  PEAK = "peak",
  VALLEY = "valley",
}

export const LineColor = {};
LineColor[TimeSeriesFeatureType.DEFAULT] = Color.LightGrey1;
LineColor[TimeSeriesFeatureType.CURRENT] = Color.Orange;
LineColor[TimeSeriesFeatureType.LAST] = Color.PaleCyan;
LineColor[TimeSeriesFeatureType.MAX] = Color.Green;
LineColor[TimeSeriesFeatureType.MIN] = Color.Purple;
LineColor[TimeSeriesFeatureType.PEAK] = Color.LightGreen;
LineColor[TimeSeriesFeatureType.VALLEY] = Color.PalePurple;

export const DotColor = {};
DotColor[TimeSeriesFeatureType.DEFAULT] = Color.DarkGrey;
DotColor[TimeSeriesFeatureType.CURRENT] = Color.Orange;
DotColor[TimeSeriesFeatureType.LAST] = Color.PaleCyan;
DotColor[TimeSeriesFeatureType.MAX] = Color.Green;
DotColor[TimeSeriesFeatureType.MIN] = Color.Purple;
DotColor[TimeSeriesFeatureType.PEAK] = Color.LightGreen;
DotColor[TimeSeriesFeatureType.VALLEY] = Color.PalePurple;

export const TextColor = {};
TextColor[TimeSeriesFeatureType.DEFAULT] = Color.DarkGrey;
TextColor[TimeSeriesFeatureType.CURRENT] = Color.DarkOrange;
TextColor[TimeSeriesFeatureType.LAST] = Color.DarkCyan;
TextColor[TimeSeriesFeatureType.MAX] = Color.DarkGreen;
TextColor[TimeSeriesFeatureType.MIN] = Color.DarkPurple;
TextColor[TimeSeriesFeatureType.PEAK] = Color.LightGreen;
TextColor[TimeSeriesFeatureType.VALLEY] = Color.PalePurple;
