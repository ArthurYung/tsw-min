"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consoleHack = void 0;
const logger_1 = require("../logger");
const util = require("util");
let consoleHacked = false;
function consoleHack() {
    if (consoleHacked)
        return;
    consoleHacked = true;
    console.__debug = console.debug;
    console.__log = console.log;
    console.__warn = console.warn;
    console.__info = console.info;
    console.__error = console.error;
    console.debug = (message, ...optionalParams) => {
        logger_1.default.writeLog(util.format(message, ...optionalParams), "debug");
    };
    console.log = (message, ...optionalParams) => {
        logger_1.default.writeLog(util.format(message, ...optionalParams), "debug");
    };
    console.info = (message, ...optionalParams) => {
        logger_1.default.writeLog(util.format(message, ...optionalParams), "info");
    };
    console.warn = (message, ...optionalParams) => {
        logger_1.default.writeLog(util.format(message, ...optionalParams), "warn");
    };
    console.error = (message, ...optionalParams) => {
        logger_1.default.writeLog(util.format(message, ...optionalParams), "error");
    };
    process.stderr.originWrite = process.stderr.write;
    process.stderr.write = (data, encodingOrCallback) => {
        let encoding;
        if (typeof encodingOrCallback !== "function") {
            encoding = encodingOrCallback;
        }
        logger_1.default.writeLog(data.toString(encoding).replace(/\n$/, ""), // 去掉换行符
        "error");
        return true;
    };
}
exports.consoleHack = consoleHack;
//# sourceMappingURL=console.js.map