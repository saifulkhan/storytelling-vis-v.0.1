export interface ITimeSeriesData {
  date: Date;
  y: number;
}

export interface ITimeSeriesData1 {
  date: Date;
  y: number;
  mean_test_accuracy?: number;
  mean_training_accuracy?: number;
}

export type AnimationType = "beginning" | "back" | "play";
