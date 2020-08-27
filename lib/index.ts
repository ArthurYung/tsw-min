import './core/config'
import * as winston from "winston";
import * as Transport from "winston-transport";
import logger from "./core/logger";
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
  color?: boolean
}

export const jsw = (jswConfig: JswConfig = {}): void => {
  const configActions = new Map<string, Function>([
    ['color', (status: boolean) => { 
      global.jswConfig.color = status 
    }],

    ['lineLevel', (level: number) => { 
      global.jswConfig.lineLevel = level 
    }],

    ['plugins', (plugins: PluginInfo[]) => {
      plugins.forEach((plugin) => {
        plugin.init(eventBus);
      });
    }],

    ['transports', (transports: Transport[]) => {
      const winstonLogger = winston.createLogger({
        transports,
        format: winston.format.simple(), 
      });

      logger.setWinston(winstonLogger);
    }]
  ])
  
  Object.keys(jswConfig).forEach(key => {
    configActions.get(key)?.(jswConfig[key])
  })

  configActions.clear()

  consoleHack()
  requestHack();
  dnsHack();
  httpCreateServerHack();
}
