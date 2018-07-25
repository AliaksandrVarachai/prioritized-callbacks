// TODO: move out the example to Readme file
import { EVENTS } from '../src/constants';
import globals from '../src/tool-specific-helpers/globals';


function addPrioritizedDiv(priority) {
  const div = document.createElement('div');
  div.innerText = `* block with priority #${priority}`;
  window.prioritizedCallbackController.addCallback(
    EVENTS.LOAD_FEEDBACK,
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
  '</div>'
document.body.appendChild(descriptionDiv);

globals.emulateEventsLocally(); // emulates events

setTimeout(() => addPrioritizedDiv(10), 1000);
setTimeout(() => addPrioritizedDiv(20), 500);
addPrioritizedDiv(30);
