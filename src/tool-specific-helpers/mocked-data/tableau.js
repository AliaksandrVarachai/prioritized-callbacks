const visual = {};
const visuals = [visual];
const events = {};

const tableau = {
  VizManager: {
    getVizs() {
      return visuals;
    }
  },
  TableauEventName: {
    TOOLBAR_STATE_CHANGE: 'toolbarstatechange',
    CUSTOM_VIEW_LOAD: 'customviewload',
    TAB_SWITCH: 'tabswitch',
  },
};

visual.addEventListener = function(eventName, cb) {
  if (events[eventName]) {
    events[eventName].push(cb);
  } else {
    events[eventName] = [cb];
  }
};

visual.removeEventListener = function(eventName, cb) {
  if (events[eventName]) {
    const inx = events[eventName].indexOf(cb);
    if (inx > -1) {
      events[eventName].splice(inx, 1);
      if (events[eventName].length === 0)
        events[eventName] = null;
    } else {
      console.warn(`Event "${eventName}" does not have the removed listener`);
    }
  } else {
    console.warn(`There is no event "${eventName}" so the listener is not removed`);
  }
};

visual.dispatchEvent = function(eventName) {
  if (events[eventName] && events[eventName] instanceof Array) {
    events[eventName].forEach(cb => cb());
  } else {
    console.warn(`There are no listeners for dispatched event "${eventName}"`);
  }
};

// for test purpose only
function emulateEventsLocally() {
  visual.dispatchEvent(tableau.TableauEventName.CUSTOM_VIEW_LOAD);
  visual.dispatchEvent(tableau.TableauEventName.TOOLBAR_STATE_CHANGE);
  visual.dispatchEvent(tableau.TableauEventName.TAB_SWITCH);

  setTimeout(() => {
    console.log('emulation of async CUSTOM_VIEW_LOAD');
    visual.dispatchEvent(tableau.TableauEventName.CUSTOM_VIEW_LOAD);
  }, 2000)
}


export default {
  tableau,
  // next props are for local test purpose only
  emulateEventsLocally,
}
