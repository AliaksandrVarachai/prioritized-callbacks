class Middleware {
  use(fn) {
    this.go = (stack => next => stack(fn.bind(this, next.bind(this))))(this.go);
  }

  go(next) {
    next();
  }
}


class PrioritizedMiddleware extends Middleware {
  constructor(eventName) {
    super();
    this.eventName = eventName;
    this.unprioritizedFunctions = [];
  }

  getUsedPriorities() {
    return this.unprioritizedFunctions.reduce((acc, fn, priority) => {
      if (fn)
        acc.push(priority);
      return acc;
    }, []);
  }

  getEventName() {
    return this.eventName;
  }

  usePriority(fn, priority) {
    if (this.unprioritizedFunctions[priority])
      throw Error(`Priority ${priority} is in occupied priority list: [${this.getUsedPriorities().join(', ')}]`);
    this.unprioritizedFunctions[priority] = fn;
  }

  goPriority(next) {
    this.unprioritizedFunctions.filter(fn => fn).forEach(fn => this.use(fn));
    this.go(next);
  }
}

const events = {};

/**
 * Gets an instance of an PrioritizedMiddleware object providing the synchronous call of callbacks in the order of their priorities.
 * @param {string} eventName - name of event.
 * @returns {PrioritizedMiddleware} - singleton for events with the same names.
 */
export default function(eventName) {
  if (events[eventName])
    return events[eventName];
  return events[eventName] = new PrioritizedMiddleware(eventName);
}
