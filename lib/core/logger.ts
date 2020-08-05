import * as moment from "moment";
import * as chalk from "chalk";
import { Logger as WinstonLogger } from "winston";
import { address } from "ip";
import getStackInfo from "./utils/callInfo";
import currentContext from "./context";
import config from "./config";
import isInspect from "./utils/isInspect";

enum LOG_LEVEL {
  "info" = 10,
  "debug" = 20,
  "warn" = 30,
  "error" = 40,
}

enum LOG_COLOR {
  "debug" = "yellow",
  "info" = "blue",
  "warn" = "magenta",
  "error" = "red",
}

export class Logger {
  public winstonLogger: WinstonLogger;

  public debug(message: string) {
    this.writeLog(message, "debug");
  }

  public info(message: string) {
    this.writeLog(message, "info");
  }

  public warn(message: string) {
    this.writeLog(message, "warn");
  }

  public error(message: string) {
    console.log('is error')
    this.writeLog(message, "error");
  }

  public originConsole(str: string, type: string) {
    (console["__" + type] || console[type])(str);
  }

  public setWinston(context: WinstonLogger) {
    this.winstonLogger = context;
  }

  public writeLog(str: string, type = "debug") {
    const writeStr = this.formatStr(str, type);
    const context = currentContext();
    if (context) {
      context.logs.push(writeStr);
    }
    if (this.winstonLogger) {
      this.winstonLogger[type](writeStr);
    }
  }

  public formatStr(str: string, type = "debug") {
    const logLevel = LOG_LEVEL[type];
    const showLineNumber = logLevel >= config.holoConfig.lineLevel || isInspect();
    const timestamp = `[${moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS")}]`;
    const logType = `[${type.toLocaleUpperCase()}]`;

    // Formatter stackInfo to string
    const stackInfo = ((): string => {
      if (!showLineNumber) return "";
      const { line, column, filename } = getStackInfo(5);
      return `[/${filename}:${line}:${column}]`;
    })();

    // Formatter docker container name and server address
    const localInfo = `[${address()} ${process.env.HOSTNAME || "-"} ${process.pid}]`;
    const typeColor = LOG_COLOR[type];

    return `${chalk.whiteBright(timestamp)}${chalk[typeColor](logType)}${chalk.whiteBright(
      localInfo
    )}${chalk.whiteBright(stackInfo)} ${str}`;
  }
}

let logger: Logger;

if (!logger) {
  logger = new Logger()
}

export default logger;
