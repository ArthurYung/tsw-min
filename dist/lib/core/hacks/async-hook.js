"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableHook = exports.enableHook = void 0;
const domain_1 = require("../domain");
const async_hooks_1 = require("async_hooks");
const asyncHook = async_hooks_1.createHook({
    init(async, _, trigger) {
        domain_1.pushHooks(async, trigger);
    },
});
exports.enableHook = () => {
    asyncHook.enable();
};
exports.disableHook = () => {
    asyncHook.disable();
};
//# sourceMappingURL=async-hook.js.map