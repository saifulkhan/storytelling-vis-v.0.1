import moment from "moment";
import { round, sortBy } from "lodash";
import { CsvDataService } from "./utils-data";

const data = [];

const today = moment();

// seed
// precision
// datatime string

export function generateData() {
  let date_time = moment(today);

  for (let i = 0; i < 10; i++) {
    date_time = Math.round(Math.random())
      ? moment(date_time).add(1, "days")
      : moment(date_time).add(1, "hours");

    data.push({
      date_time: date_time,
      num_channels: i + 1,
      kernel_size: Math.floor(Math.random() * 20) + 1,
      num_layer: Math.floor(Math.random() * 30) + 1,
      accuracy: round(Math.random(), 2),
    });
  }

  for (let i = 0; i < 20; i++) {
    date_time = Math.round(Math.random())
      ? moment(date_time).add(1, "days")
      : moment(date_time).add(1, "hours");

    data.push({
      date_time: date_time,
      num_channels: Math.floor(Math.random() * 10) + 1,
      kernel_size: i + 1,
      num_layer: Math.floor(Math.random() * 30) + 1,
      accuracy: round(Math.random(), 2),
    });
  }

  for (let i = 0; i < 30; i++) {
    date_time = Math.round(Math.random())
      ? moment(date_time).add(1, "days")
      : moment(date_time).add(1, "hours");

    data.push({
      date_time: date_time,
      accuracy: round(Math.random(), 2),
      num_channels: Math.floor(Math.random() * 10) + 1,
      kernel_size: Math.floor(Math.random() * 30) + 1,
      num_layer: i + 1,
    });
  }

  // console.log(data);
  let all_num_channels = new Set(data.map((d) => d.num_channels));
  console.log(all_num_channels);

  for (const item of all_num_channels.keys()) {
    console.log(item);
    let values = data
      .filter((d) => d.num_channels === item)
      .map((d) => d.accuracy);
    console.log(values);
  }

  // console.log(data.map(d => { return { x: d.num_channels, y: d.accuracy } }))

  const data_sorted = sortBy(data, [
    "num_channels",
    "kernel_size",
    "num_layer",
  ]);
  CsvDataService.exportToCsv("test-data-for-story-5.csv", data_sorted);
}
