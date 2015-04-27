(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    var Component = require("../component/Component.js");

    var GameObject = cc.Node.extend({
        properties: ["name", "tag"],

        ctor : function (){
            this._super();

            this._components = [];
            this._properties = [];
            this._updateRequest = 0;

            this.name = "GameObject";

            this.addComponent("TransformComponent");
            
        },

        _getComponents: function(){
            return this._components;
        },

        addComponent : function(className){
            var c;

            if(typeof className === 'string') {
                c = this._components[className];
                if(c) return c;

                c = cl.ComponentManager.create(className);
                if(c == null){
                    console.log(className + "is not a valid Component");
                    return null;
                }

                this._components[className] = c;
            } else if(typeof className === 'object'){
                c = className;
                this._components[c.className] = c;
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

        getComponent: function(className){
            return this._components[className];
        },

        removeComponent: function (className) {
            if(typeof className === 'object') {
                className = className.className;
            }

            var c = this._components[className];

            if(c != null) {
                c._unbind();

                if(c.onUpdate) {
                    this._updateRequest--;
                    if(this._updateRequest === 0) {
                        this.unscheduleUpdate();
                    }
                }
            }

            delete this._components[className];

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
        },

        toJSON: function(){
            var json = {};

            var components = json.components = [];

            var cs = this.components;
            for(var i in cs) {
                components.push(cs[i].toJSON());
            }

            for(var k=0; k<this.children.length; k++){
                var child = this.children[k];
                if(child.constructor === cl.GameObject){
                    
                    if(!json.children) {
                        json.children = [];
                    }

                    var cj = child.toJSON();
                    json.children.push(cj);
                }
            }

            var self = this;
            this.properties.forEach(function(p) {
                json[p] = self[p];
            });

            return json;
        },

        clone: function() {
            var json = this.toJSON();
            return GameObject.fromJSON(json);
        }
    });

    GameObject.fromJSON = function(json) {
        var o = new GameObject();

        o.properties.forEach(function(p) {
            o[p] = json[p] === undefined ? o[p] : json[p];
        });

        for(var i=0; i<json.components.length; i++) {
            Component.fromJSON(o, json.components[i]);
        }

        if(json.children) {
            for(var i=0; i<json.children.length; i++){
                GameObject.fromJSON(o, json.children[i]);
            }
        }

        return o;
    };

    cl.defineGetterSetter(GameObject.prototype, "components", "_getComponents");

    module.exports = cl.GameObject = GameObject;
});
