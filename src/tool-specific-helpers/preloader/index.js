let preloader;

switch (process.env.NODE_TOOL) {
  case 'tableau':
    preloader = require('./tableau');
    break;
  default:
    throw Error(`process.env.NODE_TOOL contains wrong value "${process.env.NODE_TOOL}"`);
}

export default preloader.default;
