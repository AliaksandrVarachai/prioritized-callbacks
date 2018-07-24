// TODO: rewrite with prototypes
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
  };

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
  };
}

let singletonRenderController;

/**
 * Creates a singleton EventBus instance.
 * @returns {EventBus}
 */
export default function() {
  return singletonRenderController = singletonRenderController || new RenderController();
}
