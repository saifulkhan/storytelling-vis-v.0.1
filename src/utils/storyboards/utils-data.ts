import * as d3 from "d3";

export const readCSVFile = async (file: string) => {
  const csv = await d3.csv(file);
  console.log("readCSVFile: csv file = ", file, ",length = ", csv.length);
  return csv;
};

export const readJSONFile = async (file: string) => {
  const json = await d3.json(file);
  console.log("readJSONFile: json file = ", file);
  return json;
};

export class CsvDataService {
  static exportToCsv(filename: string, rows: object[]) {
    if (!rows || !rows.length) {
      return;
    }
    const separator = ",";
    const keys = Object.keys(rows[0]);
    const csvData =
      keys.join(separator) +
      "\n" +
      rows
        .map((row) => {
          return keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? "" : row[k];
              cell =
                cell instanceof Date
                  ? cell.toLocaleString()
                  : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join("\n");

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    // if (navigator?.msSaveBlob) {
    //   // IE 10+
    //   navigator?.msSaveBlob(blob, filename);
    // } else {
    if (typeof window !== "undefined") {
      const link = document.createElement("a");
      if (link.download !== undefined) {
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    // }
  }
}
