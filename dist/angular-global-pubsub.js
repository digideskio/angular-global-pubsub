(function(angular) {
  function PubsubService($window, $log) {
    function getRegistry() {
      if (!$window.__globalPubSubRegistry) {
        $window.__globalPubSubRegistry = {};
      }
      return $window.__globalPubSubRegistry;
    }

    function getEventRegistry(event) {
      if (!getRegistry()[event]) {
        getRegistry()[event] = {};
      }
      return getRegistry()[event];
    }

    function appendCallbackToEventRegistry(event, id, callback) {
      if (getEventRegistry(event)[id]) {
        $log.warn('Callback is already associated to event', id, event);
      }
      getEventRegistry(event)[id] = callback;
      return getEventRegistry(event)[id];
    }

    function removeCallbackFromEventRegistry(event, id) {
      if (!(getEventRegistry(event)[id])) {
        $log.warn('No callback is not associated to this event', id, event);
      }

      var eventHandler = getEventRegistry(event);
      if (eventHandler) {
        var callback = eventHandler[id];
        delete eventHandler[id];
        return callback;
      }
    }

    $window.__globalPubSub = $window.__globalPubSub || {
      publish: function(event, data) {
        try {
          var eventRegistry = getEventRegistry(event);
          if (eventRegistry) {
            Object.keys(eventRegistry)
              .forEach(function(key) {
                var callback = eventRegistry[key];
                if (callback) {
                  try {
                    callback(data);
                  } catch (e) {
                    $log.log(e);
                  }
                }
              });
          }
        } catch (e) {
          $log.error('An error has occured in the pubsub service.', e);
        }
      },
      subscribe: function(event, id, callback) {
        try {
          return appendCallbackToEventRegistry(event, id, callback);
        } catch (e) {
          $log.error('An error has occured in the pubsub service', e);
        }
      },
      unsubscribe: function(event, id) {
        try {
          return removeCallbackFromEventRegistry(event, id);
        } catch (e) {
          $log.error('An error has occured in the pubsub service', e);
        }
      }
    };
    return $window.__globalPubSub;
  }

  angular.module('tw.utilities', [])
    .service('PubSubService', ['$window', '$log', PubsubService]);
})(window.angular);
