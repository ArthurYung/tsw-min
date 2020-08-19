"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsw = void 0;
require("./core/hacks/async");
const winston = require("winston");
const logger_1 = require("./core/logger");
const config_1 = require("./core/config");
const events_1 = require("./core/events");
const create_server_1 = require("./core/hacks/create-server");
const dns_1 = require("./core/hacks/dns");
const console_1 = require("./core/hacks/console");
const request_1 = require("./core/hacks/request");
exports.jsw = (jswConfig = {}) => {
    Object.assign(config_1.default.jswConfig, jswConfig);
    config_1.default.jswConfig.plugins.forEach((plugin) => {
        plugin.init(events_1.eventBus);
    });
    if (jswConfig.transports) {
        const winstonLogger = winston.createLogger({
            transports: jswConfig.transports,
            format: winston.format.simple(),
        });
        logger_1.default.setWinston(winstonLogger);
    }
    console_1.consoleHack();
    request_1.requestHack();
    dns_1.dnsHack();
    create_server_1.httpCreateServerHack();
};
