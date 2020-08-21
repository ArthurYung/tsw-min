"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = require("../domain");
const async_hooks_1 = require("async_hooks");
async_hooks_1.createHook({
    init(async, type, trigger) {
        if (type === 'PROMISE') {
            domain_1.domainStack(async, trigger);
        }
    },
    before(asyncId) {
        domain_1.domainStack(asyncId, async_hooks_1.triggerAsyncId());
    },
}).enable();
//# sourceMappingURL=async-hook.js.map