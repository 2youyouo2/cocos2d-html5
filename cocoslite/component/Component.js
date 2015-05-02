(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var ComponentManager = require("./ComponentManager.js");

    var ctor = function(dependencies) {
        var self = this;

        var _dependencies    = dependencies ? dependencies : [];
        var _target          = null;
        var _exportedMethods = null;
        var _entered         = false;

        this.addComponent = function(className){
            if(_target)
                _target.addComponent(className);
        };

        this.getComponent = function(className){
            if(_target)
                return _target.getComponent(className);
            return null;
        },

        this._bind = function(target){
            _target = target;

            for(var k in _dependencies){
                this.addComponent(_dependencies[k]);
            }

            this.onBind(target);
        };

        this._unbind = function(){
            if(_exportedMethods != null){
                var methods = _exportedMethods;

                for(var key in methods){
                    var method = methods[key];
                    _target[method] = null;
                }
            }

            this.onUnbind(_target);
        };

        this._enter = function() {
            if(_entered) {
                return;
            }

            _entered = true;
            this.onEnter(_target);
        };

        this._exportMethods = function (methods) {

            _exportedMethods = methods;

            for(var key in methods){
                var method = methods[key];
                _target[method] = function(){
                    self[method].apply(self, arguments);
                };
            }
        };

        cl.defineGetterSetter(this, {
            "target": {
                get: function() {
                    return _target;
                }
            }
        });
    }

    var Component = cc.Class.extend({
        properties: [],
        
        ctor:ctor,
        
        onBind: function(target) {

        },
        onUnbind: function(target) {

        },
        onEnter: function(target) {

        },

        toJSON: function(){
            var json = {};
            json.class = this.className;

            for(var i=0; i<this.properties.length; i++){
                var k = this.properties[i];

                var value = this[k];

                if(this["toJSON"+k]) {
                    json[k] = this["toJSON"+k]();
                }
                else if(value !== null || value !== undefined){
                    json[k] = value.toJSON ? value.toJSON() : value;
                }
            }
            return json;
        }
    });


    var _deserializeFuncs = [];

    Component.fromJSON = function(parent, json) {
        var c = parent.addComponent(json.class);
        if(c == null) return null;
        
        for(var k in json) {
            if(k == "class") continue;
            
            var value = json[k];

            for(var i=0; i<_deserializeFuncs.length; i++) {
                var ret;
                try {
                    ret = _deserializeFuncs[i](k, value);
                }
                catch(e) {
                    console.log("SceneManager.tryReviver for [%s]failed : ", k, e);
                }
                
                if(ret) {
                    value = ret;
                }
            }

            c[k] = value;
        }

        return c;
    };

    Component.registerDeserialize = function(func) {
        _deserializeFuncs.push(func);
    };


    var stringParsers = [
        {
            re: /#?([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
            parse: function(execResult) {
                return cc.color(execResult[0]);
            }
        },
        {
            re: /cl.Enum.(\w*)+\.(\w*)+/,
            parse: function(execResult) {
                return cl.Enum[execResult[1]][execResult[2]];
            }
        }
    ];

    // register default deserialize
    Component.registerDeserialize(function(key, value) {

        var ret = null;

        if(typeof value === 'string') {

            stringParsers.forEach(function(parser) {
                var match = parser.re.exec(value);

                if(match) {
                    ret = parser.parse(match);
                }
            });
        }

        return ret;
    });

    Component.extendComponent = function(className, params, parent) {
        if(!parent) parent = Component;

        var gs = params._get_set_;
        delete params._get_set_;

        var folder = params._folder_ ? params._folder_ : parent.folder;
        delete params._folder_;

        var ret = parent.extend(params);

        if(gs) {
            cl.defineGetterSetter(ret.prototype, gs);
        }

        ret.prototype.className = ret.className = className;
        ret.folder = folder;

        ComponentManager.register(className, ret);

        return ret;
    }

    Component.init = function(obj, params) {
        for(var k in params) {
            obj[k] = params[k];
        }
    }

    module.exports = cl.Component = Component;
});
