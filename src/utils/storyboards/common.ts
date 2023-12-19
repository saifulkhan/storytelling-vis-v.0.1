import { TimeseriesType } from "./TimeseriesType";

export function findDateIdx(date: Date, data: TimeseriesType[]) {
  data.findIndex((d) => d.date.getTime() == date.getTime());
}

export function mean(data: number[]): number {
  return data.reduce((acc, val) => acc + val, 0) / data.length;
}
