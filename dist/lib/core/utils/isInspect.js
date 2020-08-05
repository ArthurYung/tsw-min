"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isInspect = () => {
    const nodeOptions = process.env.NODE_OPTIONS;
    return Boolean(nodeOptions && (nodeOptions.includes("--inspect") || nodeOptions.includes("--inspect-brk")));
};
exports.default = isInspect;
//# sourceMappingURL=isInspect.js.map