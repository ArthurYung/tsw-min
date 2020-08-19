"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = require("../../domain");
process.__originNextTick = process.nextTick;
process.nextTick = (callback, ...args) => {
    const callbackWrap = (...args) => {
        domain_1.domainStack('by next Tick: ');
        callback.apply(callback, args);
    };
    return process.__originNextTick(callbackWrap, ...args);
};
process.nextTick;
//# sourceMappingURL=tick.js.map