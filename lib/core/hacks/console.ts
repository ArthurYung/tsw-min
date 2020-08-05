import logger from "../logger";
import * as util from "util";

let consoleHacked = false;

export function consoleHack(): void {
  if (consoleHacked) return;
  consoleHacked = true;
  console.__debug = console.debug;
  console.__log = console.log;
  console.__warn = console.warn;
  console.__info = console.info;
  console.__error = console.error;

  console.debug = (message?: any, ...optionalParams: any[]): void => {
    logger.writeLog(util.format(message, ...optionalParams), "debug");
  };

  console.log = (message?: any, ...optionalParams: any[]): void => {
    logger.writeLog(util.format(message, ...optionalParams), "debug");
  };

  console.info = (message?: any, ...optionalParams: any[]): void => {
    logger.writeLog(util.format(message, ...optionalParams), "info");
  };

  console.warn = (message?: any, ...optionalParams: any[]): void => {
    logger.writeLog(util.format(message, ...optionalParams), "warn");
  };

  console.error = (message?: any, ...optionalParams: any[]): void => {
    logger.writeLog(util.format(message, ...optionalParams), "error");
  };

  (process.stderr as any).originWrite = process.stderr.write;
  process.stderr.write = (
    data: Buffer | string,
    encodingOrCallback?: string | ((err?: Error) => void) | undefined
  ): boolean => {
    let encoding: BufferEncoding;
    if (typeof encodingOrCallback !== "function") {
      encoding = encodingOrCallback as BufferEncoding;
    }

    logger.writeLog(
      data.toString(encoding).replace(/\n$/, ""), // 去掉换行符
      "error"
    );

    return true;
  };
}
