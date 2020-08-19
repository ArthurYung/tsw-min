import { EventEmitter } from "events";
import { domainStack } from '../../domain'
EventEmitter.prototype.__originEmit = EventEmitter.prototype.emit

EventEmitter.prototype.emit = function(event, ...args) {
  domainStack()
  return this.__originEmit(event, ...args)
}
