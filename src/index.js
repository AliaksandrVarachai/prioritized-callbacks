import preloader from './tool-specific-helpers/preloader';

// when EVENTS.LOAD_FEEDBACK is fired sets window.__toolIsReadyToAddFeedbackButtons = true
preloader.run();

// TODO: move out the example to Readme file
const prioritizedCbController = require('./helpers/prioritized-callback-controller-factory')();
const { EVENTS } = require('./constants');
prioritizedCbController.addCallback(
  EVENTS.LOAD_FEEDBACK,
  30,
  () => console.log('callback with priority #30'),
  () => console.log('rollback with priority #30')
);
prioritizedCbController.addCallback(
  EVENTS.LOAD_FEEDBACK,
  20,
  () => console.log('callback with priority #20'),
  () => console.log('rollback with priority #20'),
);
prioritizedCbController.addCallback(
  EVENTS.LOAD_FEEDBACK,
  10,
  () => console.log('callback with priority #10'),
  () => console.log('rollback with priority #10'),
);

