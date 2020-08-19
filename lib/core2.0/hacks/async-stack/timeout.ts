import { domainStack } from '../../domain'

const globalObjects = global

globalObjects.__originSetTimeout = globalObjects.setTimeout
globalObjects.__originSetInterval = globalObjects.setInterval
globalObjects.__originSetImmediate = globalObjects.setImmediate

globalObjects.setTimeout = function(callback, ms, ...args) {
  const callbackWrap = (...args) => {
    domainStack()
    callback(...args)
  }
  return globalObjects.__originSetTimeout(callbackWrap, ms, args)
} as typeof setTimeout

globalObjects.setInterval = function(callback, ms, ...args) {
  const callbackWrap = (...args) => {
    domainStack()
    callback(...args)
  }
  return globalObjects.__originSetInterval(callbackWrap, ms, args)
} as typeof setInterval

globalObjects.setImmediate = function(callback, ...args) {
  const callbackWrap = (...args) => {
    domainStack()
    callback(...args)
  }
  return globalObjects.__originSetImmediate(callbackWrap, args)
} as typeof setImmediate
