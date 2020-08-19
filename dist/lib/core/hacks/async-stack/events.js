"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const domain_1 = require("../../domain");
events_1.EventEmitter.prototype.__originEmit = events_1.EventEmitter.prototype.emit;
events_1.EventEmitter.prototype.emit = function (event, ...args) {
    domain_1.domainStack();
    return this.__originEmit(event, ...args);
};
