(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var Component    = require("../Component.js");
    var PhysicsShape = require("./PhysicsShape.js");


    var PhysicsBox = Component.extendComponent("PhysicsBox", {
        properties: PhysicsShape.prototype.properties.concat(['width', 'height']),

        ctor: function() {
            this._super();

            this._width  = 50;
            this._height = 50;
        },

        updateBox: function() {
            var verts = this.createVerts();

            // if(this._shape.setVerts) {
            //     this._shape.setVerts(verts, cp.vzero);
            // } else {
                cl.space.removeShape(this._shape);
                this._shape = this.createShape();
                cl.space.addShape(this._shape);
            // }

        },

        createVerts: function() {
            var hw = this._width/2;
            var hh = this._height/2;

            var verts = [
                -hw, -hh,
                -hw,  hh,
                 hw,  hh,
                 hw, -hh
            ];

            return verts;
        },

        createShape: function() {
            return new cp.PolyShape(this.getBody(), this.createVerts(), cp.vzero);
        },

        _get_set_: {
            width: {
                get: function() {
                    return this._width;
                },
                set: function(val) {
                    this._width = val;
                    this.updateBox();
                }
            },

            height: {
                get: function() {
                    return this._height;
                },
                set: function(val) {
                    this._height = val;
                    this.updateBox();
                }
            }
        }
    }, PhysicsShape);

    module.exports = PhysicsBox;
});
