import { NumericalFeatureType } from "../../utils/storyboards/FeatureType";

export enum Color {
  ForestGreen = "#228B22",
  DarkGreen = "#006400",
  Green = "#008000",
  KellyGreen = "#4CBB17",
  LightGreen = "#90EE90",
  Green1 = "#00bfa0",
  DarkCyan = "#00aeae",
  Cyan = "#00FFFF",
  PaleCyan = "#aaf2ef",
  CornflowerBlue = "#6495ED",
  DarkPurple = "#770737",
  Purple = "#800080",
  PurpleA = "#AA336A",
  PurpleB = "#BF40BF",
  PalePurple = "#D8BFD8",
  DarkOrange = "#EC5800",
  Orange = "#FFA500",
  PaleOrange = "#FAC898	",
  DarkGrey = "#686868",
  Grey = "#808080",
  LightGrey1 = "#A9A9A9",
  LightGrey2 = "#D3D3D3",
  PlatinumGrey = "#E5E4E2",
  WhiteGrey = "#F5F5F5",
  Red = "#E84A5F",
}

export const LineColor = {};
LineColor[NumericalFeatureType.DEFAULT] = Color.LightGrey1;
LineColor[NumericalFeatureType.CURRENT] = Color.Orange;
LineColor[NumericalFeatureType.LAST] = Color.PaleCyan;
LineColor[NumericalFeatureType.MAX] = Color.Green;
LineColor[NumericalFeatureType.MIN] = Color.Purple;
LineColor[NumericalFeatureType.PEAK] = Color.LightGreen;
LineColor[NumericalFeatureType.VALLEY] = Color.PalePurple;

export const DotColor = {};
DotColor[NumericalFeatureType.DEFAULT] = Color.DarkGrey;
DotColor[NumericalFeatureType.CURRENT] = Color.Orange;
DotColor[NumericalFeatureType.LAST] = Color.PaleCyan;
DotColor[NumericalFeatureType.MAX] = Color.Green;
DotColor[NumericalFeatureType.MIN] = Color.Purple;
DotColor[NumericalFeatureType.PEAK] = Color.LightGreen;
DotColor[NumericalFeatureType.VALLEY] = Color.PalePurple;

export const TextColor = {};
TextColor[NumericalFeatureType.DEFAULT] = Color.DarkGrey;
TextColor[NumericalFeatureType.CURRENT] = Color.DarkOrange;
TextColor[NumericalFeatureType.LAST] = Color.DarkCyan;
TextColor[NumericalFeatureType.MAX] = Color.DarkGreen;
TextColor[NumericalFeatureType.MIN] = Color.DarkPurple;
TextColor[NumericalFeatureType.PEAK] = Color.LightGreen;
TextColor[NumericalFeatureType.VALLEY] = Color.PalePurple;
