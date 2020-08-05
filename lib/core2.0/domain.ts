import * as async_hooks from 'async_hooks'
import config from './config'

const processDomain = new Map<number, DomainContext>()

interface DomainContext {
  asyncId: number
  currentContext?: any
}

export const createDomain = () => {
  const asyncId = async_hooks.executionAsyncId()
  if (processDomain.size > config.jswConfig.limit) {
    processDomain.set(asyncId, null)
  } else {
    processDomain.set(asyncId, { asyncId })
  }
  return asyncId
}

export const destroyDomain = (asyncId) => {
  return processDomain.delete(asyncId)
}

export const currentDomain = () => {
  let asyncId = async_hooks.executionAsyncId()
  while (asyncId) {
    if (processDomain.has(asyncId)) {
      return processDomain.get(asyncId)
    }
    asyncId--
  }
  return null
}
