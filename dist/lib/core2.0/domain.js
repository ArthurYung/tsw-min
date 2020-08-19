"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDomain = exports.createDomain = exports.domainStack = exports.currentDomain = void 0;
const async_hooks_1 = require("async_hooks");
const runningDomains = new Map();
const asyncTriggerMap = {};
exports.currentDomain = () => {
    const asyncId = async_hooks_1.triggerAsyncId();
    const rootId = asyncTriggerMap[asyncId];
    return runningDomains.has(rootId)
        ? runningDomains.get(rootId)
        : null;
};
exports.domainStack = () => {
    const rootId = asyncTriggerMap[async_hooks_1.triggerAsyncId()];
    if (runningDomains.has(rootId)) {
        const current = async_hooks_1.executionAsyncId();
        runningDomains.get(rootId)._hooks.push(current);
        asyncTriggerMap[current] = rootId;
    }
};
exports.createDomain = (socket) => {
    const asyncId = socket
        ? socket._handle.getAsyncId()
        : async_hooks_1.executionAsyncId();
    if (!runningDomains.has(asyncId)) {
        runningDomains.set(asyncId, {
            asyncId,
            _hooks: [asyncId]
        });
        asyncTriggerMap[asyncId] = asyncId;
    }
    return asyncId;
};
exports.clearDomain = (asyncId) => {
    const currentAsyncId = asyncId || async_hooks_1.triggerAsyncId();
    const domainAsyncId = asyncTriggerMap[currentAsyncId];
    if (domainAsyncId) {
        const domain = runningDomains.get(domainAsyncId);
        process.nextTick(() => {
            domain._hooks.forEach(id => (asyncTriggerMap[id] = undefined));
            runningDomains.delete(domainAsyncId);
        });
    }
};
//# sourceMappingURL=domain.js.map