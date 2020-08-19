import './core/hacks/async'
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
