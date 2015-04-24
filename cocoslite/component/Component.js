(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var ComponentManager = require("./ComponentManager.js");

    var ctor = function(properties, dependencies) {
        var self = this;

        var _properties      = properties ? properties : [];
        var _dependencies    = dependencies ? dependencies : [];
        var _target          = null;
        var _exportedMethods = null;

        this.addComponent = function(className){
            if(_target)
                _target.addComponent(className);
        };

        this.getComponent = function(className){
            if(_target)
                return _target.getComponent(className);
            return null;
        },

        this.addProperties = function (properties){
            if(properties.constructor == Array){
                if(!_properties) {
                    _properties = [];
                }
                _properties = _properties.concat(properties);
            }
        };

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

            this.onUnbind();
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
            "properties": {
                get: function() {
                    return _properties;
                },
                set: function(val) {
                    _properties = val;
                }
            },

            "target": {
                get: function() {
                    return _target;
                }
            }
        });
    }

    var Component = cc.Class.extend({
        ctor:ctor,
        
        onBind: function(target) {

        },
        onUnbind: function(target) {

        },
        onEnter: function(target) {

        }
    });


    Component.extendComponent = function(className, params, parent) {
        if(!parent) parent = Component;

        var gs = params._get_set_;
        delete params._get_set_;

        var folder = params._folder_
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
})
