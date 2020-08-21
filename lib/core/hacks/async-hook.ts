import { domainStack,  } from '../domain'
import { createHook, triggerAsyncId } from 'async_hooks'

createHook({
  init(async, type, trigger) {
    if (type === 'PROMISE') {
      domainStack(async, trigger)
    }
  },
  before(asyncId) {
    domainStack(asyncId, triggerAsyncId())
  },
}).enable()
  