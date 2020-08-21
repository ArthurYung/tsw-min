import { executionAsyncId, triggerAsyncId } from 'async_hooks'

export type StackDomain = {
  asyncId: number
  _hooks: number[]
  currentContext?: any
}

const runningDomains = new Map<number, StackDomain>()
const asyncTriggerMap = {}

export const currentDomain = (a?: string): StackDomain => {
  const asyncId = executionAsyncId()
  const rootId = asyncTriggerMap[asyncId]
  return runningDomains.has(rootId) 
    ? runningDomains.get(rootId) 
    : null
}

export const domainStack = (async, trigger): void => {
  const rootId = asyncTriggerMap[trigger]
  if (runningDomains.has(rootId)) {
    runningDomains.get(rootId)._hooks.push(async)
    asyncTriggerMap[async] = rootId
  }
}

export const createDomain = (): number => {
  const asyncId = executionAsyncId()
  if (!runningDomains.has(asyncId)) {
    runningDomains.set(asyncId, { 
      asyncId, 
      _hooks: [ asyncId ] 
    })
  
    asyncTriggerMap[asyncId] = asyncId
  }

  return asyncId
}

export const clearDomain = (asyncId ?: number): void => {
  const currentAsyncId = asyncId || triggerAsyncId()
  const domainAsyncId = asyncTriggerMap[currentAsyncId]
  if (domainAsyncId) {
    const domain = runningDomains.get(domainAsyncId)

    domain._hooks.forEach(id => (asyncTriggerMap[id] = undefined))
    runningDomains.delete(domainAsyncId)
  }
}
