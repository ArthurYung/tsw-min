"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const moment = require("moment");
const chalk = require("chalk");
const ip_1 = require("ip");
const callInfo_1 = require("./utils/callInfo");
const context_1 = require("./context");
const config_1 = require("./config");
const isInspect_1 = require("./utils/isInspect");
var LOG_LEVEL;
(function (LOG_LEVEL) {
    LOG_LEVEL[LOG_LEVEL["info"] = 10] = "info";
    LOG_LEVEL[LOG_LEVEL["debug"] = 20] = "debug";
    LOG_LEVEL[LOG_LEVEL["warn"] = 30] = "warn";
    LOG_LEVEL[LOG_LEVEL["error"] = 40] = "error";
})(LOG_LEVEL || (LOG_LEVEL = {}));
var LOG_COLOR;
(function (LOG_COLOR) {
    LOG_COLOR["debug"] = "yellow";
    LOG_COLOR["info"] = "blue";
    LOG_COLOR["warn"] = "magenta";
    LOG_COLOR["error"] = "red";
})(LOG_COLOR || (LOG_COLOR = {}));
class Logger {
    debug(message) {
        this.writeLog(message, "debug");
    }
    info(message) {
        this.writeLog(message, "info");
    }
    warn(message) {
        this.writeLog(message, "warn");
    }
    error(message) {
        console.log('is error');
        this.writeLog(message, "error");
    }
    originConsole(str, type) {
        (console["__" + type] || console[type])(str);
    }
    setWinston(context) {
        this.winstonLogger = context;
    }
    writeLog(str, type = "debug") {
        const writeStr = this.formatStr(str, type);
        const context = context_1.default();
        if (context) {
            context.logs.push(writeStr);
        }
        if (this.winstonLogger) {
            this.winstonLogger[type](writeStr);
        }
    }
    formatStr(str, type = "debug") {
        const logLevel = LOG_LEVEL[type];
        const showLineNumber = logLevel >= config_1.default.holoConfig.lineLevel || isInspect_1.default();
        const timestamp = `[${moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS")}]`;
        const logType = `[${type.toLocaleUpperCase()}]`;
        // Formatter stackInfo to string
        const stackInfo = (() => {
            if (!showLineNumber)
                return "";
            const { line, column, filename } = callInfo_1.default(5);
            return `[/${filename}:${line}:${column}]`;
        })();
        // Formatter docker container name and server address
        const localInfo = `[${ip_1.address()} ${process.env.HOSTNAME || "-"} ${process.pid}]`;
        const typeColor = LOG_COLOR[type];
        return `${chalk.whiteBright(timestamp)}${chalk[typeColor](logType)}${chalk.whiteBright(localInfo)}${chalk.whiteBright(stackInfo)} ${str}`;
    }
}
exports.Logger = Logger;
let logger;
if (!logger) {
    logger = new Logger();
}
exports.default = logger;
//# sourceMappingURL=logger.js.map