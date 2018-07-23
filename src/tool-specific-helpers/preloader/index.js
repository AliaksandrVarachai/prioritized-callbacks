window.__toolIsReadyToAddFeedbackButtons = false;

const mock = {
  default: {
    run: function() {
      window.__toolIsReadyToAddFeedbackButtons = true;
    }
  }
};

let preloader;

switch (process.env.NODE_TOOL) {
  case 'tableau':
    preloader = process.env.IS_WEBPACK_DEV_SERVER_STARTED
      ? mock
      : require('./tableau');
    break;
  default:
    throw Error(`process.env.NODE_TOOL contains wrong value "${process.env.NODE_TOOL}"`);
}

export default preloader.default;
