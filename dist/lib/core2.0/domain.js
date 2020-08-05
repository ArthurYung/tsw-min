"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentDomain = exports.destroyDomain = exports.createDomain = void 0;
const async_hooks = require("async_hooks");
const config_1 = require("./config");
const processDomain = new Map();
exports.createDomain = () => {
    const asyncId = async_hooks.executionAsyncId();
    if (processDomain.size > config_1.default.jswConfig.limit) {
        processDomain.set(asyncId, null);
    }
    else {
        processDomain.set(asyncId, { asyncId });
    }
    return asyncId;
};
exports.destroyDomain = (asyncId) => {
    return processDomain.delete(asyncId);
};
exports.currentDomain = () => {
    let asyncId = async_hooks.executionAsyncId();
    while (asyncId) {
        if (processDomain.has(asyncId)) {
            return processDomain.get(asyncId);
        }
        asyncId--;
    }
    return null;
};
//# sourceMappingURL=domain.js.map