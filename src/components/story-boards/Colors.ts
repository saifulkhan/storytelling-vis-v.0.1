import { FeatureType } from "./FeatureType";

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
