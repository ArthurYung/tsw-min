import { enableHook, disableHook } from './hacks/async-hook'
import logger from './logger'

const defaultConfig = {
  isEnabled: false,
  lineLevel: 30,
  color: false,
}

const proxyActions = new Map<any, Function>([
  ['isEnabled', (value: boolean) => value ? enableHook() : disableHook()],
  ['color', (value: boolean) => logger.setColor(value)]
])

const isDiffProxy = (
  target: typeof defaultConfig, 
  prop: string | number | symbol, 
  value: any
): boolean => {
  return target[prop] !== value
}

global.jswConfig = new Proxy(defaultConfig, {
  set(target, prop, value) {
    if (isDiffProxy(target, prop, value)) {
      proxyActions.get(prop)?.(target, value)
      target[prop] = value
      return true
    } 

    return true
  },
  get(target, prop) {
    return target[prop]
  }
})
