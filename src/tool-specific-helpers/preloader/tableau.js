import globals from '../globals';
import eventBusFactory from '../../helpers/event-bus-factory';
import prioritizedCallbackControllerFactory from '../../helpers/prioritized-callback-controller-factory';

window.eventBus = eventBusFactory();
window.prioritizedCallbackController = prioritizedCallbackControllerFactory();

/**
 * Guarantees the controlled loading of Tableau script.
 * Provides window.eventBus = true when Tableau custom view is loaded first time.
 * Dispatches event EVENTS.LOAD_FEEDBACK when Tableau view is reloaded.
 */
function run() {
  const viz = globals.tableau.VizManager.getVizs()[0];

  viz.addEventListener(globals.tableau.TableauEventName.CUSTOM_VIEW_LOAD, function(event) {
    console.log('CUSTOM_VIEW_LOAD is called');
    // First CUSTOM_VIEW_LOAD event might be fired before our script creates a proper listener
    window.prioritizedCallbackController.setCallCallbacksWhenAdd(true); // TODO: call just only for the first time
    window.eventBus.dispatch(window.eventBus.customEventNames.LOAD_FEEDBACK, {}); // UP: updates data from DB (async)
    window.eventBus.dispatch(globals.tableau.TableauEventName.CUSTOM_VIEW_LOAD, {}); // DOWN: redraw buttons
  });

  viz.addEventListener(globals.tableau.TableauEventName.TOOLBAR_STATE_CHANGE, function(event) {
    console.log('TOOLBAR_STATE_CHANGE is called');
    window.eventBus.dispatch(globals.tableau.TableauEventName.TOOLBAR_STATE_CHANGE, {}); // DOWN: redraw buttons
  });
}

export default {
  run
}
