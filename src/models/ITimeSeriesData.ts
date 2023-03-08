export interface ITimeSeriesData {
  date: Date;
  y: number;
}

export interface ILineData {
  x: number;
  y: number;
}

export type AnimationType = "beginning" | "back" | "play";
