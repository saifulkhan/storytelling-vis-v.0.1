import { TimeseriesType } from "./TimeseriesType";

export function findDateIdx(date: Date, data: TimeseriesType[]): number {
  return data.findIndex((d) => d.date.getTime() == date.getTime());
}

export function mean(data: number[]): number {
  return data.reduce((acc, val) => acc + val, 0) / data.length;
}

export function sliceTimeseriesByDate(
  data: TimeseriesType[],
  start: Date,
  end: Date,
): TimeseriesType[] {
  return data.filter((item) => item.date >= start && item.date <= end);
}
