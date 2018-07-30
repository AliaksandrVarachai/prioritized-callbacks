function EventBus() {
  this.listeners = {};
  /**
   * Custom (tool independent) events emitted by Event Bus to loaded extensions.
   * @typedef {{LOAD_FEEDBACK: string}} CustomEventNames.
   */

  /**
   * @type {CustomEventNames}
   */
  this.customEventNames = {
    LOAD_FEEDBACK: 'LOAD_FEEDBACK',
  };

  /**
   * Namespaces to avoid of the mix custom/tool/browser events
   * @typedef {{TOOL: string, CUSTOM: string, BROWSER: string}} EventSources
   */

  /**
   * @type {EventSources}
   */
  this.eventSources = {
    TOOL: 'TOOL',
    CUSTOM: 'CUSTOM',
    BROWSER: 'BROWSER',
  };
}

/**
 * Add the callback to the given event.
 * @param eventName {string} - event name which must be used in form eventBus.toSourcedEventName(eventName, EventSources.<string>).
 * @param callback {function} - to be called after the event is emitted.
 */
EventBus.prototype.addEventListener = function(eventName, callback) {
  this._throwIfWrongEventName(eventName, false);
  this._throwIfWrongCallback(callback);
  if (!this.listeners[eventName]) {
    this.listeners[eventName] = [callback];
  } else {
    this.listeners[eventName].push(callback);
  }
};

/**
 * Removes listener with for the given event.
 * @param eventName {string} - event name which must be used in form eventBus.toSourcedEventName(eventName, EventSources.<string>).
 * @param callback {function} - callback is to be deleted.
 */
EventBus.prototype.removeEventListener = function(eventName, callback) {
  this._throwIfWrongEventName(eventName, true);
  if (arguments.length < 2) {
    this.listeners = _getObjectWithRemovedProp(this.listeners, eventName);
    return;
  }

  this._throwIfWrongCallback(callback);
  const listener = this.listeners[eventName];
  const callbackIndex = listener.indexOf(callback);
  if (callbackIndex < 0)
    throw Error(`Event "${eventName}" does not contain passed callback to remove`);
  if (listener.length === 1) {
    this.listeners = _getObjectWithRemovedProp(this.listeners, eventName);
    return;
  }
  this.listeners.splice(callbackIndex, 1);
};

/**
 * Dispatches the event with the given name.
 * @param eventName {string} - event name which must be used in form eventBus.toSourcedEventName(eventName, EventSources.<string>).
 * @param event {object} - event body (reserved).
 */
EventBus.prototype.dispatch = function(eventName, event = {}) {
  this._throwIfWrongEventName(eventName, false);
  if (this.listeners[eventName] instanceof Array)
    this.listeners[eventName].forEach(listener => listener(event));
};

/**
 * Transforms the given event name to unique one according to its source.
 * @param eventName {string} - name of the event to transform.
 * @param source {EventSources.<string>} - origin of the event.
 * @returns {string} - unique event name based on its origin.
 */
EventBus.prototype.toSourcedEventName = function(eventName, source) {
  return `${source}:${eventName}`;
};

EventBus.prototype._throwIfWrongEventName = function(eventName, isToExist = false) {
  if (!(typeof eventName === 'string' || eventName instanceof String))
    throw Error('Event name parameter must be a string');
  if (!/^[\S]+:[\S]+$/.test(eventName))
    throw Error('Event name must have a format <eventSource>:<eventName>');
  if (isToExist && !this.listeners.hasOwnProperty(eventName))
    throw Error(`Event "${eventName}" is not found on EventBus`);
};

EventBus.prototype._throwIfWrongCallback = function(callback) {
  if (typeof callback !== 'function')
    throw Error('Removed callback must be a function');
};

function _getObjectWithRemovedProp(obj, removedPropName) {
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
