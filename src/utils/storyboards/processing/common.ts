import { TimeseriesDataType } from "./TimeseriesDataType";

export function findDateIdx(date: Date, data: TimeseriesDataType[]): number {
  return data.findIndex((d) => d.date.getTime() == date.getTime());
}

export function mean(data: number[]): number {
  return data.reduce((acc, val) => acc + val, 0) / data.length;
}

export function sliceTimeseriesByDate(
  data: TimeseriesDataType[],
  start: Date,
  end: Date,
): TimeseriesDataType[] {
  return data.filter((item) => item.date >= start && item.date <= end);
}

interface FilterCondition {
  (obj: any): boolean;
}

export function createPredicate(
  predicateString: string,
): FilterCondition | null {
  try {
    // wrapping the predicateString in a function and returning the predicate function
    const predicateFunction = new Function(
      "obj",
      `return ${predicateString};`,
    ) as FilterCondition;
    return predicateFunction;
  } catch (error) {
    console.error("Error creating predicate function:", error);
    return null;
  }
}

/**
 **  Function to find indices of dates in the time series data
 **/
export function findIndicesOfDates(
  data: TimeseriesDataType[],
  dates: Date[],
): number[] {
  const indices: number[] = [];

  // iterate through the time series data
  for (let i = 0; i < data.length; i++) {
    const currentDate = data[i].date;
    // check if the current date exists in the array of dates to find
    if (dates.some((date) => date.getTime() === currentDate.getTime())) {
      indices.push(i);
    }
  }
  return indices;
}
