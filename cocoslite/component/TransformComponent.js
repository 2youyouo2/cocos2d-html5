(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var Component = require("./Component.js");

    var TransformComponent = Component.extendComponent("TransformComponent",{
        ctor: function () {
            this.properties = ["position", "scale", "rotation"];

            this._super(this);
        },

        _setPosition: function(val){
            if(this._target) {
                this._target.setPosition(val);
            }
        },
        _getPosition: function(){
            if(!this._target) {
                return cl.p();
            }
            return this._target.getPosition();
        },

        _setScale: function(val, y){
            if(y){
                this._target.scaleX = val;
                this._target.scaleY = y;
            } else {
                this._target.scaleX = val.x;
                this._target.scaleY = val.y;
            }   
        },
        _getScale: function(){
            return {x: this.scaleX, y: this.scaleY};
        },

        _setSkew: function(val, y){
            if(y){
                this._target.rotationX = val;
                this._target.rotationY = y;
            } else {
                this._target.rotationX = val.x;
                this._target.rotationY = val.y;
            }
        },
        _getSkew: function(){
            return {x: this.rotationX, y: this.rotationY};
        }
    });


    var _p = TransformComponent.prototype;
    _p._registerTargetProperty = function(p){
        var set = "_set"+p;
        var get = "_get"+p;
        var self = this;

        (function(p){
            self[set] = function(val){
                if(this._target) {
                    this._target[p] = val;
                }
            }
            self[get] = function(){
                if(!this._target) {
                    return null;
                }
                return this._target[p];
            }
        })(p);

        cl.defineGetterSetter(this, p, get, set);
    }

    _p._registerTargetProperty("x");
    _p._registerTargetProperty("y");
    _p._registerTargetProperty("scaleX");
    _p._registerTargetProperty("scaleY");
    _p._registerTargetProperty("rotationX");
    _p._registerTargetProperty("rotationY");

    cl.defineGetterSetter(_p, "position", "_getPosition",   "_setPosition");
    cl.defineGetterSetter(_p, "scale",    "_getScale",      "_setScale");
    cl.defineGetterSetter(_p, "rotation", "_getSkew",       "_setSkew");

    exports.Component = TransformComponent;
});
