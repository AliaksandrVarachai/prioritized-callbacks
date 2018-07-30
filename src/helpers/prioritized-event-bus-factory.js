import eventBusFactory from './event-bus-factory';

const eventBus = eventBusFactory();

function PrioritizedEventBus() {
  /**
   * An object stores events processors according to their priorities. Each priority must be unique.
   * @typedef {Object} prioritizedEvent
   * @property {Array.<number>} priorities - priorities sorted in ascending order.
   * @property {Array.<function>} callbacks - event processors.
   * @property {Array.<function>} rollbacks - clear changes made the callbacks before a new callbacks processing.
   */

  /**
   * @type {prioritizedEvent}
   */
  this.pEvents = {};
  this.areCallbacksAllowed = false; // callbacks must be disabled until the tool's DOM is ready
}

/**
 * Launches callbacks according to their unique priority (than less the priority then earlier the callback launched).
 * @param eventName {string|Array.<string>} - name of event to be subscribed to.
 * @param priority {number} - priority of event.
 * @param callback {function} - callback to be launched according to its priority.
 * @param rollback {function} - rollback to be executed when priority was changed.
 */
PrioritizedEventBus.prototype.addEventListener = function(eventName, priority, callback, rollback) {
  const eventNames = Array.isArray(eventName) ? eventName : [eventName];
  eventNames.forEach(_eventName => {
    const pEvent = this.pEvents[_eventName];
    if (!pEvent) {
      this.pEvents[_eventName] = {
        priorities: [priority],
        callbacks: [callback],
        rollbacks: [rollback]
      };
      eventBus.addEventListener(_eventName, () => this._runCallbacks(_eventName));
      if (this.areCallbacksAllowed)
        this._runCallbacks(_eventName);
      return;
    }

    // Calls rollback only when order of priorities is changed (for performance)
    let indexToInsert;
    for (indexToInsert = 0; indexToInsert < pEvent.priorities.length; indexToInsert++) {
      if (priority === pEvent.priorities[indexToInsert])
        throw Error(`Priority ${priority} of "${_eventName}" is already used. The list of used priorities: [${pEvent.priorities.join()}]`);
      if (priority < pEvent.priorities[indexToInsert])
        break;
    }
    if (this.areCallbacksAllowed && indexToInsert < pEvent.priorities.length)
      this._runRollbacks(_eventName);
    pEvent.priorities.splice(indexToInsert, 0, priority);
    pEvent.callbacks.splice(indexToInsert, 0, callback);
    pEvent.rollbacks.splice(indexToInsert, 0, rollback);
    if (this.areCallbacksAllowed) {
      if (indexToInsert < pEvent.priorities.length - 1) {
        this._runCallbacks(_eventName);
      } else {
        callback();
      }
    }
  });
};

/**
 * Allows or disallows to call callbacks at the moment when they are added.
 * @param areCallbacksAllowed {boolean} - true when callback can be run or false otherwise.
 */
PrioritizedEventBus.prototype.setAreCallbacksAllowed = function(areCallbacksAllowed) {
  this.areCallbacksAllowed = areCallbacksAllowed;
};

/**
 * Gets whether the call of callbacks is allowed when they are added.
 * @returns {boolean} - true if the call of callbacks is allowed and false otherwise.
 */
PrioritizedEventBus.prototype.getAreCallbacksAllowed = function() {
  return this.areCallbacksAllowed;
};

PrioritizedEventBus.prototype._runCallbacks = function(eventName) {
  if (!this.areCallbacksAllowed)
    return;
  if (!this.pEvents[eventName])
    throw Error(`No callbacks for bus event "${eventName}"`);
  this.pEvents[eventName].callbacks.forEach(callback => callback());
};

PrioritizedEventBus.prototype._runRollbacks = function(eventName) {
  if (!this.areCallbacksAllowed)
    return;
  if (!this.pEvents[eventName])
    throw Error(`No rollbacks for bus event "${eventName}"`);
  this.pEvents[eventName].rollbacks.forEach(rollback => rollback());
};

let singletonPrioritizedEventBus;

/**
 * Creates a singleton PrioritizedCallbackController instance.
 * @returns {EventBus}
 */
export default function() {
  return singletonPrioritizedEventBus = singletonPrioritizedEventBus || new PrioritizedEventBus();
}
