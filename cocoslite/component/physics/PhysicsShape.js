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

            this._shape      = null;
            this._sensor     = false;
            this._elasticity = 0;
            this._friction   = 0;
        },

        getBody: function() {
            return this._physicsBody.getBody();
        },

        createShape: function() {
            return null;
        },

        updateShape: function() {
            if(!this._physicsBody) {
                return;
            }

            if(this._shape) {
                cl.space.removeShape(this._shape);
            }

            this._shape = this.createShape();
            
            cl.space.addShape(this._shape);
        },

        onEnter: function(target) {
            this._physicsBody = this.getComponent('PhysicsBody');

            this.updateShape();
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
                    return this._elasticity;
                },
                set: function(val) {
                    this._elasticity = val;

                    if(this._shape) {
                        this._shape.setElasticity(val);
                    }
                }
            },

            friction: {
                get: function() {
                    return this._friction;
                },
                set: function(val) {
                    this._friction = val;

                    if(this._shape) {
                        this._shape.setFriction(val);
                    }
                }
            }
        },

        _show_: function() {
            return cl.config.physics === 'chipmunk';
        },

        _folder_: "physics",
        _abstract_: true
    });

    module.exports = PhysicsShape;
});
