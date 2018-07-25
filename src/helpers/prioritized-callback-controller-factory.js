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

PrioritizedCallbackController.prototype.addCallback = function(eventName, priority, callback, rollback) {
  const busEvent = this.pEvents[eventName];
  if (!busEvent) {
    this.pEvents[eventName] = {
      priorities: [priority],
      callbacks: [callback],
      rollbacks: [rollback]
    };
    eventBus.addEventListener(eventName, () => this.runCallbacks(eventName));
    if (this.callCallbacksWhenAdd)
      this.runCallbacks(eventName);
    return;
  }

  // TODO: call rollback only when order of priorities is changed
  if (this.callCallbacksWhenAdd)
    this.runRollbacks(eventName);
  for (let i = 0; i < busEvent.priorities.length; i++) {
    if (priority === busEvent.priorities[i])
      throw Error(`Priority ${priority} of "${eventName}" is already used. The list of used priorities: [${busEvent.priorities.join()}]`);
    if (priority < busEvent.priorities[i]) {
      busEvent.priorities.splice(i, 0, priority);
      busEvent.callbacks.splice(i, 0, callback);
      busEvent.rollbacks.splice(i, 0, rollback);
      break;
    }
  }
  if (this.callCallbacksWhenAdd)
    this.runCallbacks(eventName);
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
