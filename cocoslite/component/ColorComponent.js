(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var Component = require("./Component.js");

    var ColorComponent = Component.extendComponent("ColorComponent", {
        ctor: function() {
            this._super(["color", "cascadeColor", "opacity", "cascadeOpacity"]);
        },

        _get_set_: {
            "color": {
                get: function() {
                    if(!this.target) {
                        return cc.color();
                    }
                    return this.target.color;
                },
                set: function(val) {
                    this.target.color = val;
                }
            },

            "cascadeColor": {
                get: function() {
                    if(!this.target) {
                        return false;
                    }
                    return this.target.cascadeColor;
                },
                set: function(val) {
                    this.target.cascadeColor = val;
                }
            },

            "opacity": {
                get: function() {
                    if(!this.target) {
                        return 0;
                    }
                    return this.target.opacity;
                },
                set: function(val) {
                    this.target.opacity = val;
                }
            },

            "cascadeOpacity": {
                set: function(val) {
                    this.target.cascadeOpacity = val;
                },
                get: function() {
                    if(!this.target) {
                        return false;
                    }
                    return this.target.cascadeOpacity;
                }
            }
        }
    });

    exports.Component = ColorComponent;
});
