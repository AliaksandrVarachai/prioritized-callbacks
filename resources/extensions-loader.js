/**
 * That script:
 * 1. provides the control over the loading tool and extensions
 * 2. separates the developing process from affecting of other users
 * The idea is the loading of prioritized-event-bus.js synchronously before any tool scripts to provide the reliable
 * eventListener for the tool loaded event. Other extensions might be loaded asynchronously or in their own way.
 *
 * Example 1.
 * If it needs to load feedback-tool script from the localhost (https://localhost:9092) use next query param
 * ?test_ft_path=localhost%3A9092
 *
 * Example 2.
 * If it needs to load feedback-tool script remotedly from the custom path (feedback-tool/<some-path>) use next query param
 * ?test_ft_path=<some-path>
 *
 * Example 3.
 * If it needs to load all scripts guided-tour.js, feedback-tool.js and prioritized-event-bus from the local servers
 * use next query params for that:
 *    ?test_gt_path=localhost%3A9090&test_ft_path=localhost%3A9092&test_peb_path=localhost%3A9093
 */
(function() {
  var scripts = {
    'prioritized-event-bus': {
      srcPrefix: 'https://ecsb00100c96.epam.com:444/prioritized-event-bus',
      cookieTestKey: 'test_peb_path'
    },
    'feedback-tool': {
      srcPrefix: 'https://ecsb00100c96.epam.com:444/feedback-tool',
      cookieTestKey: 'test_ft_path'
    },
    'guided-tour': {
      srcPrefix: 'https://ecsb00100c96.epam.com:444/guided-tour',
      cookieTestKey: 'test_gt_path'
    },
  };

  var cookies = document.cookie.split(/;\s*/i).reduce(function(acc, rawCookiePair) {
    var cookiePairs = rawCookiePair.split('=');
    acc[cookiePairs[0]] = cookiePairs[1];
    return acc;
  }, {});

  function getSrc(scriptName) {
    if (!scripts.hasOwnProperty(scriptName))
      throw Error('There is no script with name "' + scriptName + '"');
    var srcPrefix = scripts[scriptName].srcPrefix;
    var cookieTestPath = decodeURIComponent(cookies[scripts[scriptName].cookieTestKey] || '');
    if (cookieTestPath) {
      var src = /^localhost(:\d+)?$/i.test(cookieTestPath)
        ? 'https://' + cookieTestPath + '/' + scriptName + '.js'
        : srcPrefix + '/' + cookieTestPath + '/' + scriptName + '.js';
      console.log(scriptName + ' is provided from ' + src);
      return src;
    }
    return srcPrefix + '/' + scriptName + '.js';
  }

  // Scripts ordered and configured for synch/async loading
  var loadedScripts = [
    {
      id: 'prioritized-event-bus-script', // lets event-bus-script listens Tableau CUSTOM
      src: getSrc('prioritized-event-bus'),
      async: false
    }, {
      id: 'feedback-tool-script',
      src: getSrc('feedback-tool'),
      async: true
    }, {
      id: 'guided-tour-script',
      src: getSrc('guided-tour'),
      async: true,
      preloaders: [
        {
          type: 'application/javascript',
          src: scripts['guided-tour'].srcPrefix + '/jquery-3.2.1.min.js',
          async: false
        }, {
          type: 'application/javascript',
          src: scripts['guided-tour'].srcPrefix + '/bootstrap_guided_tour.js',
          async: false
        }, {
          type: 'text/css',
          href: scripts['guided-tour'].srcPrefix + '/bootstrap_guided_tour.css'
        }
      ]
    }
  ];

  loadedScripts.forEach(function(script) {
    var scriptElement = document.createElement('script');
    scriptElement.id = script.id;
    scriptElement.async = script.async;
    scriptElement.src = script.src;
    if (script.preloaders && script.preloaders instanceof Array) {
      script.preloaders.forEach(function(preloader) {
        var preloaderElement;
        switch (preloader.type) {
          case 'application/javascript':
            preloaderElement = document.createElement('script');
            preloaderElement.async = preloader.async;
            preloaderElement.src = preloader.src;
            break;
          case 'text/css':
            preloaderElement = document.createElement('link');
            preloaderElement.rel = 'stylesheet';
            preloaderElement.type = preloader.type;
            preloaderElement.href = preloader.href;
            break;
          default:
            console.log('Type "' + preloader.script + '" is not supported for script ' + preloader.path);
        }
        document.head.appendChild(preloaderElement);
      });
    }
    document.head.appendChild(scriptElement);
  });
})();
