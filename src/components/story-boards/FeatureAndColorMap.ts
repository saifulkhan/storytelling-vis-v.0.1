import { Color } from "./Colors";

export enum FeatureType {
  DEFAULT = "default",
  CURRENT = "current",
  LAST = "last",
  MAX = "max",
  MIN = "min",
  PEAK = "peak",
  VALLEY = "valley",
}

export const LineColor = {};
LineColor[FeatureType.DEFAULT] = Color.LightGrey1;
LineColor[FeatureType.CURRENT] = Color.Orange;
LineColor[FeatureType.LAST] = Color.PaleCyan;
LineColor[FeatureType.MAX] = Color.Green;
LineColor[FeatureType.MIN] = Color.Purple;
LineColor[FeatureType.PEAK] = Color.LightGreen;
LineColor[FeatureType.VALLEY] = Color.PalePurple;

export const DotColor = {};
DotColor[FeatureType.DEFAULT] = Color.DarkGrey;
DotColor[FeatureType.CURRENT] = Color.Orange;
DotColor[FeatureType.LAST] = Color.PaleCyan;
DotColor[FeatureType.MAX] = Color.Green;
DotColor[FeatureType.MIN] = Color.Purple;
DotColor[FeatureType.PEAK] = Color.LightGreen;
DotColor[FeatureType.VALLEY] = Color.PalePurple;

export const TextColor = {};
TextColor[FeatureType.DEFAULT] = Color.DarkGrey;
TextColor[FeatureType.CURRENT] = Color.DarkOrange;
TextColor[FeatureType.LAST] = Color.DarkCyan;
TextColor[FeatureType.MAX] = Color.DarkGreen;
TextColor[FeatureType.MIN] = Color.DarkPurple;
TextColor[FeatureType.PEAK] = Color.LightGreen;
TextColor[FeatureType.VALLEY] = Color.PalePurple;
