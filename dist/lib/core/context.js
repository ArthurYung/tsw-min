"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const domain_1 = require("./domain");
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
    const context = domain_1.currentDomain();
    if (!context) {
        return null;
    }
    if (!context.currentContext) {
        context.currentContext = new Context();
    }
    return context.currentContext;
};
