(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var ComponentManager = require("./ComponentManager.js");

    var Component = cc.Class.extend({
    
        ctor : function(instance, dependencies){
            this._instance = instance;
            this._properties = this._properties ? this._properties : [];

            this._dependencies = dependencies;
        },

        _getProperties: function(){
            return this._properties;
        },
        _setProperties: function(val){
            if(val.constructor == Array){
                this._properties = val;
            }
        },

        getTarget: function(){
            return this._target;
        },

        addComponent: function(className){
            if(this._target)
                this._target.addComponent(className);
        },
        getComponent: function(className){
            if(this._target)
                return this._target.getComponent(className);
            return null;
        },

        addProperties : function (properties){
            if(properties.constructor == Array){
                if(!this.properties) {
                    this.properties = [];
                }
                this.properties = this.properties.concat(properties);
            }
        },

        _bind : function(target){
            this._target = target;

            var ds = this._dependencies;
            if(ds){
                for(var k in ds){
                    this.addComponent(ds[k]);
                }
            }

            this.onBind(target);
        },

        _unbind : function(){
            if(this._exportedMethods != null){
                var methods = this._exportedMethods;

                for(var key in methods){
                    var method = methods[key];
                    this._target[method] = null;
                }
            }

            this.onUnbind();
        },

        _exportMethods : function (methods) {

            this._exportedMethods = methods;
            for(var key in methods){
                var method = methods[key];
                this._target[method] = function(){
                    this[method].apply(this._instance, arguments);
                };
            }
        },

        onBind: function(target){

        },
        onUnbind: function(target){

        },

        onEnter : function(target) {

        }
    });

    cl.defineGetterSetter(Component.prototype, "properties", "_getProperties", "_setProperties");

    Component.extendComponent = function(className, params, parent) {
        if(!parent) parent = Component;

        var ret = parent.extend(params);
        ret.className = className;
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
