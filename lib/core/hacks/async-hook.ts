import { pushHooks } from '../domain'
import { createHook } from 'async_hooks'

const asyncHook = createHook({
  init(async, _, trigger) {
    pushHooks(async, trigger)
  },
})

export const enableHook = ():void => {
  asyncHook.enable()
}

export const disableHook = ():void => {
  asyncHook.disable()
}
  