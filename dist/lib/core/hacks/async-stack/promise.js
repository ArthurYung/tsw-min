"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = require("../../domain");
Promise.prototype.__originThen = Promise.prototype.then;
Promise.prototype.__originCatch = Promise.prototype.catch;
Promise.prototype.__originFinally = Promise.prototype.finally;
Promise.prototype.then = function (onfulfilled, onrejected) {
    const fulfilledWarp = (value) => {
        domain_1.domainStack();
        return onfulfilled(value);
    };
    if (onrejected && typeof onrejected === 'function') {
        const rejectedWarp = (res) => {
            domain_1.domainStack();
            return onrejected(res);
        };
        return this.__originThen(fulfilledWarp, rejectedWarp);
    }
    return this.__originThen(fulfilledWarp);
};
Promise.prototype.catch = function (onrejected) {
    const rejectedWarp = (res) => {
        domain_1.domainStack();
        return onrejected(res);
    };
    return this.__originCatch(rejectedWarp);
};
Promise.prototype.finally = function (onfinally) {
    const finallyWrap = () => {
        domain_1.domainStack();
        onfinally();
    };
    return this.__originFinally(finallyWrap);
};
