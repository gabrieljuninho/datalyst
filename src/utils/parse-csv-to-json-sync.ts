import fs from "fs";
import Papa from "papaparse";

interface ReturnFunction {
  message: string;
}

interface CSVRow {
  [key: string]: string | number;
}

enum ErrorCode {
  FileNotFound = "FILE_NOT_FOUND",
  CSVParseError = "CSV_PARSE_ERROR",
  FileWriteError = "FILE_WRITE_ERROR",
  UnexpectedError = "UNEXPECTED_ERROR",
}

export const parse_csv_to_json_sync = (
  inputFilePath: string,
  outputFilePath: string
): ReturnFunction => {
  try {
    if (!fs.existsSync(inputFilePath)) {
      throw new Error(`${ErrorCode.FileNotFound}: ${inputFilePath} not found`);
    }

    const fileContent = fs.readFileSync(inputFilePath, "utf8");

    const results = Papa.parse<CSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (results.errors.length > 0) {
      throw new Error(
        `${ErrorCode.CSVParseError}: Failed to parse the CSV file. Please ensure the CSV format is valid.`
      );
    }

    const jsonData = JSON.stringify(results.data, null, 2);

    fs.writeFileSync(outputFilePath, jsonData, "utf8");

    return {
      message: `Successfully converted CSV to JSON and saved to ${outputFilePath}`,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes(ErrorCode.FileNotFound)) {
        throw new Error(
          `${ErrorCode.FileNotFound}: ${inputFilePath} not found`
        );
      } else if (error.message.includes(ErrorCode.CSVParseError)) {
        throw new Error(
          `${ErrorCode.CSVParseError}: Failed to parse the CSV file. Please ensure the CSV format is valid.`
        );
      } else if (error.message.includes(ErrorCode.FileWriteError)) {
        throw new Error(
          `${ErrorCode.FileWriteError}: Error writing the parsed data to the output file. Please check file permissions or the output path.`
        );
      } else {
        throw new Error(`Unexpected error: ${error.message}`);
      }
    }

    throw new Error("Unexpected error during file processing.");
  }
};
