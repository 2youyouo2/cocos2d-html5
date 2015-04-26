(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    var _map = {};

    cc.eventManager.addListener(cc.EventListener.create({

        event: cc.EventListener.KEYBOARD,

        onKeyPressed: function(key, event) {
            _map[key] = true;
        },

        onKeyReleased: function(key, event) {
            delete _map[key];
        },
    }), 10000);

    function getKeyDown(key) {
        return _map[key];
    }

    exports.getKeyDown = getKeyDown;
    
});
