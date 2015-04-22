(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    var GameObject = cc.Node.extend({

        ctor : function (){
            this._super();

            this._components = [];
            this._properties = [];
            this._updateRequest = 0;

            // this.addProperties(["x", "y", "scaleX", "scaleY", "rotationX", "rotationY"]);
            this.name = "GameObject";

            this.addComponent("TransformComponent");
            
        },

        _setProperties: function(val){
            if(val.constructor == Array){
                this._properties = val;
            }
        },
        _getProperties: function(){
            return this._properties;
        },

        _getComponents: function(){
            return this._components;
        },

        addProperties : function (properties){
            if(properties.constructor == Array){
                this.properties = this.properties.concat(properties);
            }
        },

        addComponent : function(classname){
            var c;

            if(typeof classname === 'string') {
                c = this._components[classname];
                if(c) return c;

                c = cl.ComponentManager.create(classname);
                if(c == null){
                    console.log(classname + "is not a valid Component");
                    return null;
                }

                this._components[classname] = c;
            } else if(typeof classname === 'object'){
                c = classname;
                this._components[c.classname] = c;
            }

            c._bind(this);

            if(c.onUpdate) {
                if(this._updateRequest === 0 && this.isRunning()) {
                    this.scheduleUpdate();
                }
                this._updateRequest++;
            }

            if(this.isRunning()) {
                c.onEnter(this);
            }

            return c;
        },

        addComponents : function(classnames){
            for(var key in classnames){
                this.addCompoent(classnames[key]);
            }
        },

        getComponent: function(classname){
            return this._components[classname];
        },

        removeComponent: function (classname) {
            if(typeof classname === 'object') {
                classname = classname.classname;
            }

            var c = this._components[classname];

            if(c != null) {
                c._unbind();

                if(c.onUpdate) {
                    this._updateRequest--;
                    if(this._updateRequest === 0) {
                        this.unscheduleUpdate();
                    }
                }
            }

            this._components[classname] = null;

            return c;
        },

        onEnter: function() {
            cc.Node.prototype.onEnter.call(this);

            for(var key in this._components){
                this._components[key].onEnter(this);
            }

            if(this._updateRequest > 0) {
                this.scheduleUpdate();
            }
        },

        update: function(dt) {
            if(!this.isRunning()) return;

            for(var key in this._components){
                var c = this._components[key];
                if(c.onUpdate) {
                    c.onUpdate(this);
                }
            }
        },

        hitTest: function(worldPoint){
            for(var key in this._components){
                var c = this._components[key];
                if(c.hitTest != null && c.hitTest(worldPoint))
                    return true;
            }

            return false;
        }
    });

    cl.defineGetterSetter(GameObject.prototype, "components", "_getComponents");
    cl.defineGetterSetter(GameObject.prototype, "properties", "_getProperties", "_setProperties");

    module.exports = cl.GameObject = GameObject;
});