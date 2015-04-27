(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    var KeyManager = function(element) {

        var _map = {};

        this.isKeyDown = function(key) {
            return _map[key];
        };
        
        this.matchKeyDown = function(keys) {
            keys = keys.length ? keys : [keys];

            if(Object.keys(_map).length !== keys.length) {
                return false;
            }

            var match = true;

            for(var i in keys) {
                if(!_map[keys[i]]) {
                    match = false;
                    break;
                }
            }

            return match;
        };

        this.onKeyPressed = function(key) {
            _map[key] = true;
        }

        this.onKeyReleased = function(key) {
            delete _map[key];
        }

        // for web application
        if(element) {
            var self = this;

            element.addEventListener('keydown', function(e) {
                self.onKeyPressed(e.which);
            });

            element.addEventListener('keyup', function(e) {
                self.onKeyReleased(e.which);
            });
        }
    }
    
    cl.keyManager = new KeyManager;
    cl.KeyManager = KeyManager;

    cc.eventManager.addListener(cc.EventListener.create({

        event: cc.EventListener.KEYBOARD,

        onKeyPressed : cl.keyManager.onKeyPressed,
        onKeyReleased: cl.keyManager.onKeyReleased

    }), 10000);

    module.exports = cl.keyManager;
});
