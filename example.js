import getPrioritizedMiddleware from './src/index_old';

function f1(next) {
  setTimeout(() => {
    console.log('f1 is called');
    next()
  }, 1000);
}
function f2(next) {
  console.log('f2 is called');
  next();
}
function f3(next) {
  console.log('f3 is called');
  next();
}

const prioritizedMiddleware1 = getPrioritizedMiddleware('myEventName');
const prioritizedMiddleware2 = getPrioritizedMiddleware('myEventName');

prioritizedMiddleware1.usePriority(f3, 30);
prioritizedMiddleware2.usePriority(f2, 20);
prioritizedMiddleware2.usePriority(f1, 10);

/*
  output:
  f1 is called
  f2 is called
  f3 is called
  prioritized go called from module #1
 */
prioritizedMiddleware1.goPriority(function() {
  console.log('prioritized go called from module #1');
});

