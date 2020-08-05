import * as async_hooks from 'async_hooks'

const processDomain = new Map<number, any>()
const hooksTriggerMap = new Map<number, number>()

export class CreateDomain {
  private rootAsyncId: number
  private asyncHook: async_hooks.AsyncHook
  public currentContext: any
  constructor() {
    this.rootAsyncId = async_hooks.executionAsyncId()
    this.initAsyncHook()
  }
  public initAsyncHook() {
    const self = this
    this.asyncHook = async_hooks.createHook({
      init(asyncId, _, triggerAsyncId) {
        self.rootAsyncId = hooksTriggerMap.get(triggerAsyncId) || asyncId
        processDomain.set(self.rootAsyncId, self)
        hooksTriggerMap.set(asyncId, self.rootAsyncId)
      },
      destroy(asyncId) {
        hooksTriggerMap.delete(asyncId)
      }
    }).enable()
  }
  public destroy() {
    this.asyncHook.disable()
    processDomain.delete(this.rootAsyncId)
  }
}

export const getDomain = (): CreateDomain | null => {
  const asyncId = async_hooks.executionAsyncId()
  const rootId = hooksTriggerMap.get(asyncId)
  return processDomain.get(rootId)
}
