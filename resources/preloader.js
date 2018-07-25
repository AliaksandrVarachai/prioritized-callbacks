// TODO: rewrite jsdoc
/**
 * That script need to separate developing process from affecting of other users.
 * IMPORTANT: That script must not be used on production. The loading of Feedback Tool script by the document must be direct.
 *
 * @example <caption>Example of the direct injecting of Feedback Tool script on production</caption>
 * <script src=""https://ecsb00100c96.epam.com:444/feedback-tool/feedback-tool.js"></script>
 *
 * @example <caption>Example of using Feedback Tool Preloader on development</caption>
 * <script src=""https://ecsb00100c96.epam.com:444/feedback-tool/feedback-tool-preloader.js"></script>
 * // The preloader script checks test_ft_path cookies and chooses the path to feedback-tool.js according to next algorithm:
 * // if test_ft_path = localhost%3A9092 (where port 9092 could be replaced with another one):
 * //   src = https://localhost:9092/feedback-tool.js
 * // else if test_ft_path = 'custom_path':
 * //   src = https://ecsb00100c96.epam.com:444/feedback-tool/custom_path/feedback-tool.js
 * // else
 * //   src = https://ecsb00100c96.epam.com:444/feedback-tool/feedback-tool.js
 */
(function() {
  var scripts = {
    'event-bus': {
      srcPrefix: 'https://ecsb00100c96.epam.com:444/event-bus',
      cookieTestKey: 'test_event_bus_path'
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
      throw Error(`There is no script with name "${scriptName}"`);
    var srcPrefix = scripts[scriptName].srcPrefix;
    var cookieTestPath = cookies[scripts[scriptName].cookieTestKey];
    return cookieTestPath
      ? `${srcPrefix}/${cookieTestPath}/${scriptName}.js`
      : `${srcPrefix}/${scriptName}.js`;
  }

  // Scripts ordered and configured for synch/async loading
  var loadedScripts = [
    {
      id: 'event-bus-script', // lets event-bus-script listens Tableau CUSTOM
      src: getSrc('event-bus'),
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
          src: `${scripts['guided-tour'].srcPrefix}/jquery-3.2.1.min.js`,
          async: false
        }, {
          type: 'application/javascript',
          src: `${scripts['guided-tour'].srcPrefix}/bootstrap_guided_tour.js`,
          async: false
        }, {
          type: 'text/css',
          href: `${scripts['guided-tour'].srcPrefix}/bootstrap_guided_tour.css`,
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
            console.log(`Type "${preloader.script}" is not supported for script ${preloader.path}`)
        }
        document.head.appendChild(preloaderElement);
      });
    }
    document.head.appendChild(scriptElement);
  });
})();
