// TODO: move out the example to Readme file
import globals from '../src/tool-specific-helpers/globals';

const eventBus = window.eventBus;

function addPrioritizedDiv(priority) {
  const div = document.createElement('div');
  div.innerText = `* block with priority #${priority}`;
  window.prioritizedEventBus.addEventListener(
    eventBus.toSourcedEventName(
      eventBus.customEventNames.LOAD_FEEDBACK,
      eventBus.eventSources.CUSTOM
    ),
    priority,
    () => {
      document.body.appendChild(div);
      console.log(`+ #${priority}`);
    },
    () => {
      document.body.removeChild(div);
      console.log(`- #${priority}`);
    }
  );
}

/**
 * Expected document: list of blocks sorted ascending order.
 * Log is in the console.
 */
const descriptionDiv = document.createElement('div');
document.body.innerHTML =
  '<div style="padding-bottom: 10px">' +
    'Here should be a list of blocks sorted in ascending order by the priority (to see the log open the console):' +
  '</div>';
document.body.appendChild(descriptionDiv);

globals.emulateEventsLocally(); // emulates events

setTimeout(() => addPrioritizedDiv(10), 1000);
setTimeout(() => addPrioritizedDiv(20), 500);
addPrioritizedDiv(30);
setTimeout(() => addPrioritizedDiv(40), 1200); // must call the callback (without call of rollbacks)
