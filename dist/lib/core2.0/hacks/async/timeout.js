"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = require("../../domain");
const globalObjects = global;
globalObjects.__originSetTimeout = globalObjects.setTimeout;
globalObjects.__originSetInterval = globalObjects.setInterval;
globalObjects.__originSetImmediate = globalObjects.setImmediate;
globalObjects.setTimeout = function (callback, ms, ...args) {
    const callbackFn = (...args) => {
        domain_1.updateAsync(' === timeout cb');
        callback(...args);
    };
    return globalObjects.__originSetTimeout(callbackFn, ms, args);
};
globalObjects.setInterval = function (callback, ms, ...args) {
    const callbackFn = (...args) => {
        domain_1.updateAsync(' === interval cb');
        callback(...args);
    };
    return globalObjects.__originSetInterval(callbackFn, ms, args);
};
globalObjects.setImmediate = function (callback, ...args) {
    const callbackFn = (...args) => {
        domain_1.updateAsync();
        callback(...args);
    };
    return globalObjects.__originSetImmediate(callbackFn, args);
};
//# sourceMappingURL=timeout.js.map