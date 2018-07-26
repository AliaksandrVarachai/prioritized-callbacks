import preloader from './tool-specific-helpers/preloader';
/**
 * Provides global variables:
 * window.eventBus {object} - processes tool-specific events and fires tool-independent eventBus's custom events.
 * window.prioritizedCallbackController {object} - adds callbacks for any tool-specific or browser events and fires eventBus's custom events.
 */
preloader.run();
