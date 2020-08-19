import { domainStack } from '../../domain'

process.__originNextTick = process.nextTick

process.nextTick = (callback, ...args) => {
  const callbackWrap = (...args) => {
    domainStack()
    callback.apply(callback, args)
  }
  return process.__originNextTick(callbackWrap, ...args)
}

process.nextTick
