// Mock meteorhacks:fast-render public API

(function () {
  var noop = function () {}

  Package['meteorhacks:fast-render'] = {
    FastRender: {
      'debugger': {
        blockDDP: noop,
        disableFR: noop,
        enableFR: noop,
        getLogs: function () {
          return [];
        },
        getLogsJSON: function () {
          return "[]"
        },
        getPayload: function () {
          return {
            subscriptions: {},
            data: {}
          }
        },
        getPayloadJSON: function () {
          return '{"subscriptions":{},"data": {}}'
        },
        hideLogs: noop,
        log: noop,
        showLogs: noop,
        unblockDDP: noop
      },
      enabled: false,
      init: noop,
      injectDdpMessage: noop
    }
  }
})()
