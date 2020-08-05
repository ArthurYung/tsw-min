"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
class Context {
    constructor() {
        this.logs = [];
        this.timestamp = Date.now();
        this.captureRequests = [];
        this.captureSN = 0;
        this.isReport = false;
    }
}
exports.Context = Context;
exports.default = () => {
    if (!process.domain) {
        return null;
    }
    if (!process.domain.currentContext) {
        process.domain.currentContext = new Context();
    }
    return process.domain.currentContext;
};
//# sourceMappingURL=context.js.map