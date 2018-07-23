import { EVENTS } from '../../constants/client';
import globals from '../globals';
import eventBusFactory from '../../helpers/event-bus-factory';

const eventBus = eventBusFactory();

/**
 * Guarantees the controlled loading of Tableau script.
 * Sets window.__toolIsReadyToAddFeedbackButtons = true when Tableau custom view is loaded first time.
 * Dispatches event EVENTS.LOAD_FEEDBACK when Tableau view is reloaded.
 */
function run() {
  const viz = globals.tableau.VizManager.getVizs()[0];

  viz.addEventListener(globals.tableau.TableauEventName.CUSTOM_VIEW_LOAD, function(event) {
    // First CUSTOM_VIEW_LOAD event might be fired before our script creates a proper listener
    window.__toolIsReadyToAddFeedbackButtons = true;

    eventBus.dispatch(EVENTS.LOAD_FEEDBACK, {});
  });
}

export default {
  run
}
