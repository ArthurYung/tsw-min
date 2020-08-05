"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const logger_1 = require("./core/logger");
const config_1 = require("./core/config");
const events_1 = require("./core/events");
const create_server_1 = require("./core/hacks/create-server");
const dns_1 = require("./core/hacks/dns");
const console_1 = require("./core/hacks/console");
const request_1 = require("./core/hacks/request");
function default_1(jswConfig = {}) {
    Object.assign(config_1.default.holoConfig, jswConfig);
    const winstonLogger = winston.createLogger({
        transports: [
            new winston.transports.Console({ level: 'silly' }),
            ...(jswConfig.transports || [])
        ],
        format: winston.format.simple(),
    });
    config_1.default.holoConfig.plugins.forEach((plugin) => {
        plugin.init(events_1.eventBus);
    });
    logger_1.default.setWinston(winstonLogger);
    request_1.requestHack();
    console_1.consoleHack();
    dns_1.dnsHack();
    create_server_1.httpCreateServerHack();
}
exports.default = default_1;
//# sourceMappingURL=index-old.js.map