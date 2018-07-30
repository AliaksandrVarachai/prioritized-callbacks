import globals from '../globals';
import eventBusFactory from '../../helpers/event-bus-factory';
import prioritizedEventBusFactory from '../../helpers/prioritized-event-bus-factory';

const eventBus = window.eventBus = eventBusFactory();
const prioritizedEventBus = window.prioritizedEventBus = prioritizedEventBusFactory();
const tableau = globals.tableau;
const { CUSTOM, TOOL, BROWSER } = eventBus.eventSources;

/**
 * Guarantees the controlled loading of Tableau script.
 * Provides window.eventBus = true when Tableau custom view is loaded first time.
 * Dispatches event EVENTS.LOAD_FEEDBACK when Tableau view is reloaded.
 */
function run() {
  const viz = tableau.VizManager.getVizs()[0];


  viz.addEventListener(tableau.TableauEventName.CUSTOM_VIEW_LOAD, function(event) {
    // First CUSTOM_VIEW_LOAD event might be fired before our script creates a proper listener
    prioritizedEventBus.setAreCallbacksAllowed(true);
    // UP: updates data from DB (async)
    eventBus.dispatch(eventBus.toSourcedEventName(eventBus.customEventNames.LOAD_FEEDBACK, CUSTOM), {});
    // DOWN: redraw buttons
    eventBus.dispatch(eventBus.toSourcedEventName(tableau.TableauEventName.CUSTOM_VIEW_LOAD, TOOL), {});
  });


  viz.addEventListener(tableau.TableauEventName.TOOLBAR_STATE_CHANGE, function(event) {
    // DOWN: redraw buttons
    window.eventBus.dispatch(eventBus.toSourcedEventName(tableau.TableauEventName.TOOLBAR_STATE_CHANGE, TOOL), {});
  });


  const FULL_SCREEN_REDRAW_TIMOUT = 1000; // ms

  // TODO: leave only one 'fullscreenchange' event
  document.addEventListener('fullscreenchange', event => {
    setTimeout(
      () => window.eventBus.dispatch(eventBus.toSourcedEventName('fullscreenchange', BROWSER)), // DOWN: redraw buttons
      FULL_SCREEN_REDRAW_TIMOUT
    );
  }, false);

  document.addEventListener('mozfullscreenchange', event => {
    setTimeout(
      () => window.eventBus.dispatch(eventBus.toSourcedEventName('mozfullscreenchange', BROWSER)), // DOWN: redraw buttons
      FULL_SCREEN_REDRAW_TIMOUT
    );
  }, false);

  document.addEventListener('webkitfullscreenchange', event => {
    setTimeout(
      () => window.eventBus.dispatch(eventBus.toSourcedEventName('webkitfullscreenchange', BROWSER)), // DOWN: redraw buttons
      FULL_SCREEN_REDRAW_TIMOUT
    );
  }, false);
}

export default {
  run
}
