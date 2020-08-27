"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsw = void 0;
require("./core/config");
const winston = require("winston");
const logger_1 = require("./core/logger");
const events_1 = require("./core/events");
const create_server_1 = require("./core/hacks/create-server");
const dns_1 = require("./core/hacks/dns");
const console_1 = require("./core/hacks/console");
const request_1 = require("./core/hacks/request");
exports.jsw = (jswConfig = {}) => {
    const configActions = new Map([
        ['color', (status) => {
                global.jswConfig.color = status;
            }],
        ['lineLevel', (level) => {
                global.jswConfig.lineLevel = level;
            }],
        ['plugins', (plugins) => {
                plugins.forEach((plugin) => {
                    plugin.init(events_1.eventBus);
                });
            }],
        ['transports', (transports) => {
                const winstonLogger = winston.createLogger({
                    transports,
                    format: winston.format.simple(),
                });
                logger_1.default.setWinston(winstonLogger);
            }]
    ]);
    Object.keys(jswConfig).forEach(key => {
        var _a;
        (_a = configActions.get(key)) === null || _a === void 0 ? void 0 : _a(jswConfig[key]);
    });
    configActions.clear();
    console_1.consoleHack();
    request_1.requestHack();
    dns_1.dnsHack();
    create_server_1.httpCreateServerHack();
};
//# sourceMappingURL=index.js.map