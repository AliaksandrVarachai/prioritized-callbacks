/** Tableau parent emulation */
class ToolEventBus {
  constructor() {
    this.listeners = {};
  }
  addEventListener(name, listener) {
    if (this.listeners[name]) {
      this.listeners[name].push[listener];
    } else {
      this.listeners[name] = [listener];
    }
  }
  dispatch(name) {
    this.listeners[name].forEach(listener => listener());
  }
}
const toolEventBus = new ToolEventBus();



/** Our Render Controller script */
class RenderController {
  constructor() {
    this.targetSelectors = {}; // {priorities: []<number>, elems: []<number>}
    this.iExistAttribute = 'i-exist'; // flag to ease the check if the element still in the DOM
  }
  add = (targetSelector, injectedNode, priority) => {
    if (!this.targetSelectors[targetSelector])
      this.targetSelectors[targetSelector] = {priorities: [], elems: []}
    const targetSelectorValue = this.targetSelectors[targetSelector];
    if (targetSelectorValue.priorities.indexOf(priority) > -1)
      throw Error(`Priority ${priority} of "${targetSelector}" is already used. ` +
        `List of used priorities: [${targetSelectorValue.priorities.join()}]`);

    const len = targetSelectorValue.priorities.length;
    if (len === 0 || priority > targetSelectorValue.priorities[len - 1]) {
      targetSelectorValue.priorities.push(priority);
      targetSelectorValue.elems.push(injectedNode);
      return;
    }
    for (let i = 0; i < targetSelectorValue.priorities.length; i++) {
      if (priority < targetSelectorValue.priorities[i]) {
        targetSelectorValue.priorities.splice(i, 0, priority);
        injectedNode.setAttribute(this.iExistAttribute, '');
        targetSelectorValue.elems.splice(i, 0, injectedNode);
        break;
      }
    }
  }
  inject = () => {
    Object.keys(this.targetSelectors).forEach(targetSelector => {
      const { elems } = this.targetSelectors[targetSelector];
      const targetNode = document.querySelector(targetSelector);
      // TODO: remove setTimeout
      setTimeout(() => {
        if (targetNode.querySelector(`[${this.iExistAttribute}]`))
          return;
        elems.forEach(elem => targetNode.appendChild(elem));
      }, 300);
    });
  }
}
const renderController = new RenderController();
// TODO: implement for different tools (it is only for Tableau for a while)
toolEventBus.addEventListener('CUSTOM_VIEW_LOAD', renderController.inject);

/** Tableau Viz emulation */
const div = document.getElementById('div');
let counter = 0;
const intervalId = setInterval(() => {
  div.innerText = ++counter;
  toolEventBus.dispatch('CUSTOM_VIEW_LOAD');
}, 1000);



/** Custom script 1 */
const elem1 = document.createElement('span');
elem1.innerText = 'priority 20;';
renderController.add('#div', elem1, 20);

/** Custom script 2 */
const elem2 = document.createElement('span');
elem2.innerText = 'priority 10;';
renderController.add('#div', elem2, 10);

/** Custom script 3 */
const elem3 = document.createElement('span');
elem3.innerText = 'priority 15;';
renderController.add('#div', elem3, 15);


