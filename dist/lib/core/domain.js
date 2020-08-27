"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDomain = exports.createDomain = exports.pushHooks = exports.currentDomain = void 0;
const async_hooks_1 = require("async_hooks");
const runningDomains = new Map();
const asyncHooksMap = {};
exports.currentDomain = () => {
    const asyncId = async_hooks_1.triggerAsyncId();
    const rootId = asyncHooksMap[asyncId];
    return runningDomains.has(rootId) ? runningDomains.get(rootId) : null;
};
exports.pushHooks = (async, trigger) => {
    const rootId = asyncHooksMap[trigger];
    if (runningDomains.has(rootId)) {
        runningDomains.get(rootId)._hooks.push(async);
        asyncHooksMap[async] = rootId;
    }
};
exports.createDomain = () => {
    const asyncId = async_hooks_1.executionAsyncId();
    const rootId = async_hooks_1.triggerAsyncId() || asyncId;
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
exports.clearDomain = (asyncId) => {
    const currentAsyncId = asyncId || async_hooks_1.triggerAsyncId();
    const domainAsyncId = asyncHooksMap[currentAsyncId];
    console.log(currentAsyncId, domainAsyncId, asyncHooksMap);
    if (domainAsyncId) {
        const domain = runningDomains.get(domainAsyncId);
        domain._hooks.forEach((id) => {
            asyncHooksMap[id] = undefined;
        });
        runningDomains.delete(domainAsyncId);
    }
};
//# sourceMappingURL=domain.js.map