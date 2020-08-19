"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = require("../../domain");
const globalObjects = global;
globalObjects.__originSetTimeout = globalObjects.setTimeout;
globalObjects.__originSetInterval = globalObjects.setInterval;
globalObjects.__originSetImmediate = globalObjects.setImmediate;
globalObjects.setTimeout = function (callback, ms, ...args) {
    const callbackWrap = (...args) => {
        domain_1.domainStack();
        callback(...args);
    };
    return globalObjects.__originSetTimeout(callbackWrap, ms, args);
};
globalObjects.setInterval = function (callback, ms, ...args) {
    const callbackWrap = (...args) => {
        domain_1.domainStack();
        callback(...args);
    };
    return globalObjects.__originSetInterval(callbackWrap, ms, args);
};
globalObjects.setImmediate = function (callback, ...args) {
    const callbackWrap = (...args) => {
        domain_1.domainStack();
        callback(...args);
    };
    return globalObjects.__originSetImmediate(callbackWrap, args);
};
//# sourceMappingURL=timeout.js.map