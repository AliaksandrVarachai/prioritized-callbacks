import eventBusFactory from './event-bus-factory';

const eventBus = eventBusFactory();

function PrioritizedCallbackController() {
  this.busEvents = {}; //{priorities: []<number>, callbacks: []<function>}
}

PrioritizedCallbackController.prototype.addCallback = function(eventName, priority, callback) {
  // TODO: add extra call when new callback is added (priorities are changed)
  const busEvent = this.busEvents[eventName];
  if (!busEvent) {
    this.busEvents[eventName] = {priorities: [priority], callbacks: [callback]};
    eventBus.addEventListener(eventName, () => this.runCallbacks(eventName));
    return;
  }
  for (let i = 0; i < busEvent.priorities.length; i++) {
    if (priority === busEvent.priorities[i])
      throw Error(`Priority ${priority} of "${eventName}" is already used. The list of used priorities: [${busEvent.priorities.join()}]`);
    if (priority < busEvent.priorities[i]) {
      busEvent.priorities.splice(i, 0, priority);
      busEvent.callbacks.splice(i, 0, callback);
      break;
    }
  }
};

PrioritizedCallbackController.prototype.runCallbacks = function(eventName) {
  if (!this.busEvents[eventName])
    throw Error(`No callbacks for bus event "${eventName}"`);
  Object.keys(this.busEvents[eventName].callbacks).forEach(() => callback());
};

let singletonPrioritizedCallbackController;

/**
 * Creates a singleton PrioritizedCallbackController instance.
 * @returns {EventBus}
 */
export default function() {
  return singletonPrioritizedCallbackController = singletonPrioritizedCallbackController || new PrioritizedCallbackController();
}
