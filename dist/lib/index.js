"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsw = void 0;
require("./core2.0/hacks/async");
const winston = require("winston");
const logger_1 = require("./core2.0/logger");
const config_1 = require("./core2.0/config");
const events_1 = require("./core2.0/events");
const create_server_1 = require("./core2.0/hacks/create-server");
const dns_1 = require("./core2.0/hacks/dns");
const console_1 = require("./core2.0/hacks/console");
const request_1 = require("./core2.0/hacks/request");
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
//# sourceMappingURL=index.js.map