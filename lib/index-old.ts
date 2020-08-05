import * as winston from "winston";
import * as Transport from "winston-transport";
import logger from "./core/logger";
import config from "./core/config";
import { eventBus, EventBus } from "./core/events";
import { httpCreateServerHack } from "./core/hacks/create-server";
import { dnsHack } from "./core/hacks/dns";
import { consoleHack } from "./core/hacks/console";
import { requestHack } from "./core/hacks/request";

interface PluginInfo {
  init: (events: EventBus) => void;
}

interface JswConfig {
  lineLevel?: number;
  transports?: Transport[];
  plugins?: PluginInfo[];
}

export default function (jswConfig: JswConfig = {}): void {
  Object.assign(config.holoConfig, jswConfig);
  
  const winstonLogger = winston.createLogger({
    transports: [
      new winston.transports.Console({ level: 'silly' }), 
      ...(jswConfig.transports || [])
    ],
    format: winston.format.simple(),
  });

  config.holoConfig.plugins.forEach((plugin) => {
    plugin.init(eventBus);
  });

  logger.setWinston(winstonLogger);

  requestHack();
  consoleHack();
  dnsHack();
  httpCreateServerHack();
}
