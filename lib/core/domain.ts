import { executionAsyncId, triggerAsyncId } from "async_hooks";

export type StackDomain = {
  asyncId: number;
  _hooks: number[];
  currentContext?: any;
};

const runningDomains = new Map<number, StackDomain>();
const asyncHooksMap = {};

export const currentDomain = (): StackDomain => {
  const asyncId = triggerAsyncId();
  const rootId = asyncHooksMap[asyncId];
  return runningDomains.has(rootId) ? runningDomains.get(rootId) : null;
};

export const pushHooks = (async, trigger): void => {
  const rootId = asyncHooksMap[trigger];
  if (runningDomains.has(rootId)) {
    runningDomains.get(rootId)._hooks.push(async);
    asyncHooksMap[async] = rootId;
  }
};

export const createDomain = (): number => {
  const asyncId = executionAsyncId();
  const rootId = triggerAsyncId() || asyncId;

  if (!runningDomains.has(rootId)) {
    runningDomains.set(rootId, {
      asyncId: rootId,
      _hooks: [rootId, asyncId]
    });

    asyncHooksMap[rootId] = rootId;
    asyncHooksMap[asyncId] = rootId;
  }

  return rootId;
};

export const clearDomain = (asyncId?: number): void => {
  const currentAsyncId = asyncId || triggerAsyncId();
  const domainAsyncId = asyncHooksMap[currentAsyncId];
  console.log(currentAsyncId, domainAsyncId, asyncHooksMap)
  if (domainAsyncId) {
    const domain = runningDomains.get(domainAsyncId);

    domain._hooks.forEach((id) => {
      asyncHooksMap[id] = undefined;
    });

    runningDomains.delete(domainAsyncId);
  }
};
