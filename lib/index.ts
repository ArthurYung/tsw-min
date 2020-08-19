import './core2.0/hacks/async'
import * as winston from "winston";
import * as Transport from "winston-transport";
import logger from "./core2.0/logger";
import config from "./core2.0/config";
import { eventBus, EventBus } from "./core2.0/events";
import { httpCreateServerHack } from "./core2.0/hacks/create-server";
import { dnsHack } from "./core2.0/hacks/dns";
import { consoleHack } from "./core2.0/hacks/console";
import { requestHack } from "./core2.0/hacks/request";

interface PluginInfo {
  init: (events: EventBus) => void;
}

interface JswConfig {
  lineLevel?: number;
  transports?: Transport[];
  plugins?: PluginInfo[];
  limit?: number; // 最大并发上报数, 默认100
}

export const jsw = (jswConfig: JswConfig = {}): void => {
  Object.assign(config.jswConfig, jswConfig);
  
  config.jswConfig.plugins.forEach((plugin) => {
    plugin.init(eventBus);
  });

  if (jswConfig.transports) {
    const winstonLogger = winston.createLogger({
      transports: jswConfig.transports,
      format: winston.format.simple(), 
    });
    logger.setWinston(winstonLogger);
  }

  consoleHack()
  requestHack();
  dnsHack();
  httpCreateServerHack();
}
