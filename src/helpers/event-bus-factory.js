import { EVENTS } from '../constants';

function EventBus() {
  this.listeners = {};
  this.eventNames = EVENTS;
}

EventBus.prototype.addEventListener = function(eventName, callback) {
  this._throwIfWrongEventName(eventName, false);
  this._throwIfWrongCallback(callback);
  if (!this.listeners[eventName]) {
    this.listeners[eventName] = [callback];
  } else {
    this.listeners[eventName].push(callback);
  }
  return callback;
};

EventBus.prototype.removeEventListener = function(eventName, callback) {
  this._throwIfWrongEventName(eventName, true);
  if (arguments.length < 2) {
    this.listeners = getObjectWithRemovedProp(this.listeners, eventName);
    return;
  }

  this._throwIfWrongCallback(callback);
  const listener = this.listeners[eventName];
  const callbackIndex = listener.indexOf(callback);
  if (callbackIndex < 0)
    throw Error(`Event "${eventName}" does not contain passed callback to remove`);
  if (listener.length === 1) {
    this.listeners = getObjectWithRemovedProp(this.listeners, eventName);
    return;
  }
  this.listeners.splice(callbackIndex, 1);
};

EventBus.prototype.dispatch = function(eventName, event = {}) {
  this._throwIfWrongEventName(eventName, false);
  if (this.listeners[eventName] instanceof Array)
    this.listeners[eventName].forEach(listener => listener(event));
};


EventBus.prototype._throwIfWrongEventName = function(eventName, isToExist = false) {
  if (!(typeof eventName === 'string' || eventName instanceof String))
    throw Error('Event name parameter must be a string');
  if (isToExist && !this.listeners.hasOwnProperty(eventName))
    throw Error(`Event "${eventName}" is not found on EventBus`);
};

EventBus.prototype._throwIfWrongCallback = function(callback) {
  if (typeof callback !== 'function')
    throw Error('Removed callback must be a function');
};

function getObjectWithRemovedProp(obj, removedPropName) {
  const { [removedPropName]: _, ...newObj } =  obj;
  return newObj;
}

let singletonEventBus;

/**
 * Creates a singleton EventBus instance.
 * @returns {EventBus}
 */
export default function() {
  return singletonEventBus = singletonEventBus || new EventBus();
}
