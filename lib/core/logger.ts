import * as moment from "moment";
import * as chalk from "chalk";
import { Logger as WinstonLogger } from "winston";
import * as Stream from 'stream'
import getStackInfo from "./utils/callInfo";
import currentContext from "./context";
import config from "./config";
import { isInspect } from "./utils/isInspect";

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
    this.writeLog(message, "error");
  }

  public originConsole(str: string, type: string) {
    (console["__" + type] || console[type])(str);
  }

  public setWinston(context: WinstonLogger) {
    this.winstonLogger = context;
  }

  public writeLog(str: string, type = "debug") {
    const writeStr = this.formatStr({ str, type, color: isInspect });
    const context = currentContext();
    if (context) {
      context.logs.push(writeStr);
    }

    if (this.winstonLogger) {
      this.winstonLogger[type](writeStr);
    }

    if (isInspect) {
      Logger.fillInspect(writeStr, type)
    } 
    
    Logger.fillStdout(writeStr)
  }

  public formatStr(info: {
    str: string,
    type: string,
    color?: boolean
  }) {
    const timestamp = `[${moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS")}]`;
    const logType = `[${info.type.toLocaleUpperCase()}]`;

    const showLineNumber = ((logType) => {
      if (isInspect) return true
      return LOG_LEVEL[logType] >= config.jswConfig.lineLevel
    })(info.type)
  
    // Formatter stackInfo to string
    const stackInfo = ((): string => {
      if (!showLineNumber) return "";
      const { line, column, filename } = getStackInfo(5);
      return `[/${filename}:${line}:${column}]`;
    })();

    // Formatter docker container name and server address
    const localInfo = (() => {
      if (process.env.HOSTNAME) {
        return `[${process.env.HOSTNAME}][${process.pid}]`
      }
      return `[${process.pid}]`
    })();

    if (info.color) {
      const typeColor = LOG_COLOR[info.type];
      return `${chalk.whiteBright(timestamp)}${chalk[typeColor](logType)}${chalk.whiteBright(
        localInfo
      )}${chalk.whiteBright(stackInfo)} ${info.str}`;
    }

    return `${timestamp}${logType}${localInfo}${stackInfo} ${info.str}`
  }

  static fillInspect(str: string, type: string) {
    if ((console as any)._stdout === process.stdout) {
      const empty = new Stream.Writable();
      empty.write = (): boolean => false;
      empty.end = (): void => {};
      (console as any)._stdout = empty;
      (console as any)._stderr = empty;
    }
    (console["__" + type] || console[type])(str);
  }

  static fillStdout(str) {
    process.stdout.write(str + '\n')
  }
}

let logger: Logger;

if (!logger) {
  logger = new Logger()
}

export default logger;
