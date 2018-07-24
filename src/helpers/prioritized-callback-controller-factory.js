import eventBusFactory from './event-bus-factory';

const eventBus = eventBusFactory();

function PrioritizedCallbackController() {
  this.busEvents = {}; //{priorities: []<number>, callbacks: []<function>, rollbacks: []<function>}
}

PrioritizedCallbackController.prototype.addCallback = function(eventName, priority, callback, rollback) {
  const busEvent = this.busEvents[eventName];
  if (!busEvent) {
    this.busEvents[eventName] = {
      priorities: [priority],
      callbacks: [callback],
      rollbacks: [rollback]
    };
    eventBus.addEventListener(eventName, () => this.runCallbacks(eventName));
    this.runCallbacks(eventName);
    return;
  }
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
  this.runRollbacks(eventName);
  this.runCallbacks(eventName);
};

PrioritizedCallbackController.prototype.runCallbacks = function(eventName) {
  if (!this.busEvents[eventName])
    throw Error(`No callbacks for bus event "${eventName}"`);
  Object.keys(this.busEvents[eventName].callbacks).forEach(callback => callback());
};

PrioritizedCallbackController.prototype.runRollbacks = function(eventName) {
  if (!this.busEvents[eventName])
    throw Error(`No rollbacks for bus event "${eventName}"`);
  Object.keys(this.busEvents[eventName].rollbacks).forEach(rollback => rollback());
};

let singletonPrioritizedCallbackController;

/**
 * Creates a singleton PrioritizedCallbackController instance.
 * @returns {EventBus}
 */
export default function() {
  return singletonPrioritizedCallbackController = singletonPrioritizedCallbackController || new PrioritizedCallbackController();
}
