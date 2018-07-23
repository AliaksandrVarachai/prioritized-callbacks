export default {
  tableau: getTableauObj()
};

// The tableau object can not be retrieved in third-party application due to cross-domain issue.
function getTableauObj() {
  try {
    return window.parent.tableau;
  } catch (errorMsg) {
    console.log('Can not retrieve window.parent.tableau');
    return null;
  }
}