"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async_hook_1 = require("./hacks/async-hook");
const logger_1 = require("./logger");
const defaultConfig = {
    isEnabled: false,
    lineLevel: 30,
    color: false,
};
const proxyActions = new Map([
    ['isEnabled', (value) => value ? async_hook_1.enableHook() : async_hook_1.disableHook()],
    ['color', (value) => logger_1.default.setColor(value)]
]);
const isDiffProxy = (target, prop, value) => {
    return target[prop] !== value;
};
global.jswConfig = new Proxy(defaultConfig, {
    set(target, prop, value) {
        var _a;
        if (isDiffProxy(target, prop, value)) {
            (_a = proxyActions.get(prop)) === null || _a === void 0 ? void 0 : _a(target, value);
            target[prop] = value;
            return true;
        }
        return true;
    },
    get(target, prop) {
        return target[prop];
    }
});
//# sourceMappingURL=config.js.map