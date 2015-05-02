(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var Component = require("../Component.js");

    var PhysicsShape = Component.extendComponent("PhysicsShape", {
        properties: ['sensor', 'elasticity', 'friction'],

        ctor: function() {
            this._super(['PhysicsBody']);

            this._shape = null;
            this._sensor = false;
        },

        getBody: function() {
            return this.getComponent('PhysicsBody').getBody();
        },

        createShape: function() {
            return null;
        },

        onBind: function(target) {
            this._shape = this.createShape();
            cl.space.addShape( this._shape );
        },

        onUnbind: function(target) {
            cl.space.removeShape( this._shape );
            this._shape = null;
        },

        _get_set_: {
            sensor: {
                get: function() {
                    return this._sensor;
                },
                set: function(val) {
                    this._sensor = val;

                    if(!this._shape) {
                        return;
                    }
                    this._shape.setSensor(val);
                }
            },

            elasticity: {
                get: function() {
                    if(!this._shape) {
                        return 0;
                    }
                    return this._shape.e;
                },
                set: function(val) {
                    if(!this._shape) {
                        return;
                    }
                    this._shape.setElasticity(val);
                }
            },

            friction: {
                get: function() {
                    if(!this._shape) {
                        return 0;
                    }
                    return this._shape.u;
                },
                set: function(val) {
                    if(!this._shape) {
                        return;
                    }
                    this._shape.setFriction(val);
                }
            }
        },

        _folder_: "physics"
    });

    module.exports = PhysicsShape;
});
