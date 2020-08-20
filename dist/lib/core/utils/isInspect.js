"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInspect = void 0;
function checkNodeOptions() {
    return process.env.NODE_OPTIONS
        && process.env.NODE_OPTIONS.startsWith('--inspect');
}
function checkExecArgs() {
    const args = process.execArgv;
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--inspect'))
            return true;
    }
    return false;
}
exports.isInspect = (function () {
    return checkNodeOptions() || checkExecArgs();
})();
//# sourceMappingURL=isInspect.js.map