"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = void 0;
const events_1 = require("events");
let bus;
exports.eventBus = bus || (bus = new events_1.EventEmitter());
