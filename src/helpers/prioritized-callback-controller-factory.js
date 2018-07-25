import eventBusFactory from './event-bus-factory';

const eventBus = eventBusFactory();

function PrioritizedCallbackController() {
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
  this.callCallbacksWhenAdd = false; // callbacks must be disabled until the tool's DOM is ready
}

/**
 * Launches callbacks according to their unique priority (than less the priority then earlier the callback launched).
 * @param eventName {string|Array.<string>} - name of event to be subscribed to.
 * @param priority {number} - priority of event.
 * @param callback {function} - callback to be launched according to its priority.
 * @param rollback {function} - rollback to be executed when priority was changed.
 */
PrioritizedCallbackController.prototype.addCallback = function(eventName, priority, callback, rollback) {
  const eventNames = Array.isArray(eventName) ? eventName : [eventName];
  eventNames.forEach(_eventName => {
    const pEvent = this.pEvents[_eventName];
    if (!pEvent) {
      this.pEvents[_eventName] = {
        priorities: [priority],
        callbacks: [callback],
        rollbacks: [rollback]
      };
      eventBus.addEventListener(_eventName, () => this.runCallbacks(_eventName));
      if (this.callCallbacksWhenAdd)
        this.runCallbacks(_eventName);
      return;
    }

    // TODO: call rollback only when order of priorities is changed
    if (this.callCallbacksWhenAdd)
      this.runRollbacks(_eventName);
    for (let i = 0; i < pEvent.priorities.length; i++) {
      if (priority === pEvent.priorities[i])
        throw Error(`Priority ${priority} of "${_eventName}" is already used. The list of used priorities: [${pEvent.priorities.join()}]`);
      if (priority < pEvent.priorities[i]) {
        pEvent.priorities.splice(i, 0, priority);
        pEvent.callbacks.splice(i, 0, callback);
        pEvent.rollbacks.splice(i, 0, rollback);
        break;
      }
    }
    if (this.callCallbacksWhenAdd)
      this.runCallbacks(_eventName);
  });
};

PrioritizedCallbackController.prototype.runCallbacks = function(eventName) {
  if (!this.pEvents[eventName])
    throw Error(`No callbacks for bus event "${eventName}"`);
  this.pEvents[eventName].callbacks.forEach(callback => callback());
};

PrioritizedCallbackController.prototype.runRollbacks = function(eventName) {
  if (!this.pEvents[eventName])
    throw Error(`No rollbacks for bus event "${eventName}"`);
  this.pEvents[eventName].rollbacks.forEach(rollback => rollback());
};

PrioritizedCallbackController.prototype.setCallCallbacksWhenAdd = function(callCallbacksWhenAdd) {
  this.callCallbacksWhenAdd = callCallbacksWhenAdd;
};

PrioritizedCallbackController.prototype.getCallCallbacksWhenAdd = function() {
  return this.callCallbacksWhenAdd;
};

let singletonPrioritizedCallbackController;

/**
 * Creates a singleton PrioritizedCallbackController instance.
 * @returns {EventBus}
 */
export default function() {
  return singletonPrioritizedCallbackController = singletonPrioritizedCallbackController || new PrioritizedCallbackController();
}
