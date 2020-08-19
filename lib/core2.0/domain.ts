import { executionAsyncId, triggerAsyncId } from 'async_hooks'

export type StackDomain = {
  asyncId: number
  _hooks: number[]
  currentContext?: any
}

const runningDomains = new Map<number, StackDomain>()
const asyncTriggerMap = {}

export const currentDomain = (): StackDomain => {
  const asyncId = triggerAsyncId()
  const rootId = asyncTriggerMap[asyncId]

  return runningDomains.has(rootId) 
    ? runningDomains.get(rootId) 
    : null
}

export const domainStack = (): void => {
  const rootId = asyncTriggerMap[triggerAsyncId()]
  if (runningDomains.has(rootId)) {
    const current = executionAsyncId()
    runningDomains.get(rootId)._hooks.push(current)
    asyncTriggerMap[current] = rootId
  }
}

export const createDomain = (socket?: any): number => {
  const asyncId = socket 
    ? socket._handle.getAsyncId() 
    : executionAsyncId()

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
    process.nextTick(() => {
      domain._hooks.forEach(id => (asyncTriggerMap[id] = undefined))
      runningDomains.delete(domainAsyncId)
    })
  }
}
