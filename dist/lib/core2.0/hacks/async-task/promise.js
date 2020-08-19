"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = require("../../domain");
Promise.prototype.__originThen = Promise.prototype.then;
Promise.prototype.__originCatch = Promise.prototype.catch;
Promise.prototype.__originFinally = Promise.prototype.finally;
Promise.prototype.then = function (onfulfilled, onrejected) {
    const callbackFns = [];
    if (onfulfilled) {
        callbackFns.push((value) => {
            domain_1.domainStack(' === resolve cb');
            return onfulfilled(value);
        });
    }
    if (onrejected) {
        callbackFns.push((value) => {
            domain_1.domainStack();
            return onfulfilled(value);
        });
    }
    return this.__originThen(...callbackFns);
};
Promise.prototype.catch = function (onrejected) {
    const onrejectedFn = (res) => {
        domain_1.domainStack(' === reject cb');
        return onrejected(res);
    };
    return this.__originCatch(onrejectedFn);
};
Promise.prototype.finally = function (onfinally) {
    const onfinallyFn = () => {
        domain_1.domainStack(' === finally cb');
        onfinally();
    };
    return this.__originFinally(onfinallyFn);
};
//# sourceMappingURL=promise.js.map