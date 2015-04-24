(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var ComponentManager = cc.Class.extend({
        ctor : function () {
            this._classes = new Array();
        },

        register : function(name, cls){
            this._classes[name] = cls;
        },

        unregister : function(name){
            this._classes[name] = null;
        },

        create : function (name) {
            var cls = this._classes[name];

            if(cls != null)
                return new cls(arguments);

            return null;
        },

        getAllClasses: function(){
            return this._classes;
        }
    });

    module.exports = cl.ComponentManager = new ComponentManager;
});
