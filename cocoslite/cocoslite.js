cl = cl ? cl : {};


(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    cl.defineGetterSetter = function(obj, attr, getter, setter){
        var p = obj;
        if(typeof getter == 'function')
            p.__defineGetter__(attr, getter);
        else if(typeof getter == 'string')
            p.__defineGetter__(attr, p[getter]);
        
        if(typeof setter == 'function')
            p.__defineSetter__(attr, setter);
        else if(typeof setter == 'string')  
            p.__defineSetter__(attr, p[setter]);
    }

    cl.defineGetterSetter(cc.Node.prototype, "name", "getName", "setName");

    cc.Node.prototype.name = "Node";
    cc.Layer.prototype.name = "Layer";
    cc.Scene.prototype.name = "Scene";

});


