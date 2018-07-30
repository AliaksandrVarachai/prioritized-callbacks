import globals from '../globals';
import eventBusFactory from '../../helpers/event-bus-factory';
import prioritizedEventBusFactory from '../../helpers/prioritized-event-bus-factory';

const eventBus = window.eventBus = eventBusFactory();
const prioritizedEventBus = window.prioritizedEventBus = prioritizedEventBusFactory();
const tableau = globals.tableau;

/**
 * Guarantees the controlled loading of Tableau script.
 * Provides window.eventBus = true when Tableau custom view is loaded first time.
 * Dispatches event EVENTS.LOAD_FEEDBACK when Tableau view is reloaded.
 */
function run() {
  const viz = tableau.VizManager.getVizs()[0];


  viz.addEventListener(tableau.TableauEventName.CUSTOM_VIEW_LOAD, function(event) {
    console.log('CUSTOM_VIEW_LOAD is called');
    // First CUSTOM_VIEW_LOAD event might be fired before our script creates a proper listener
    prioritizedEventBus.setAreCallbacksAllowed(true);
    eventBus.dispatch(eventBus.customEventNames.LOAD_FEEDBACK, {});   // UP: updates data from DB (async)
    eventBus.dispatch(tableau.TableauEventName.CUSTOM_VIEW_LOAD, {}); // DOWN: redraw buttons
  });


  viz.addEventListener(tableau.TableauEventName.TOOLBAR_STATE_CHANGE, function(event) {
    console.log('TOOLBAR_STATE_CHANGE is called');
    window.eventBus.dispatch(tableau.TableauEventName.TOOLBAR_STATE_CHANGE, {}); // DOWN: redraw buttons
  });


  const FULL_SCREEN_REDRAW_TIMOUT = 1000; // ms

  // TODO: leave only one 'fullscreenchange' event
  document.addEventListener('fullscreenchange', event => {
    console.log('fullscreenchange');
    setTimeout(() => window.eventBus.dispatch('fullscreenchange'), FULL_SCREEN_REDRAW_TIMOUT); // DOWN: redraw buttons
  }, false);

  document.addEventListener('mozfullscreenchange', event => {
    console.log('mozfullscreenchange');
    setTimeout(() => window.eventBus.dispatch('mozfullscreenchange'), FULL_SCREEN_REDRAW_TIMOUT); // DOWN: redraw buttons
  }, false);

  document.addEventListener('webkitfullscreenchange', event => {
    console.log('webkitfullscreenchange');
    setTimeout(() => window.eventBus.dispatch('webkitfullscreenchange'), FULL_SCREEN_REDRAW_TIMOUT); // DOWN: redraw buttons
  }, false);
}

export default {
  run
}
