(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var Component = require("../Component.js");

    var PhysicsBody = Component.extendComponent("PhysicsBody", {
        properties: [],

        ctor: function() {
            this._super();

            this._duringUpdate = false;

            this._body = new cp.Body(1, cp.momentForBox(1, 48, 108) );
            cl.space.addBody( this._body );
        },

        getBody: function() {
            return this._body;
        },

        onBind: function(target) {
            var self = this;

            this.t = this.getComponent("TransformComponent");

            target._originSetPosition = target.setPosition;
            target.setPosition = function(x, y) {
                this._originSetPosition.apply(this, arguments);

                if(self._duringUpdate) {
                    return;
                }

                if (y === undefined) {
                    self._body.setPos(x);
                } else {
                    self._body.setPos(cl.p(x, y));
                }
            }

            target._originSetRotation = target.setRotation;
            target.setRotation = function(r) {
                this._originSetRotation.apply(this, arguments);

                if(self._duringUpdate) {
                    return;
                }

                self._body.a = -cc.degreesToRadians(r);
            }

            cl.defineGetterSetter(target, "position", target.getPosition, target.setPosition);
            cl.defineGetterSetter(target, "rotation", target.getRotation, target.setRotation);

            target.position = target.position;
            target.rotation = target.rotation;
        },

        onUnbind: function(target) {
            target.setPosition = target._originSetPosition;
            target.setRotation = target._originSetRotation;

            cl.defineGetterSetter(target, "position", target.getPosition, target.setPosition);
            cl.defineGetterSetter(target, "rotation", target.getRotation, target.setRotation);
        },

        _syncPosition:function () {
            var p = this._body.getPos();
            var locPosition = this.t.position;

            if (locPosition.x !== p.x || locPosition.y !== p.y) {
                this.t.position = cl.p(p);
            }
        },
        _syncRotation:function () {
            var a = -cc.radiansToDegrees(this._body.getAngle());
            if (this.t.rotationX !== a) {
                this.t.rotation = a;
            }
        },

        onUpdate: function(dt) {
            this._duringUpdate = true;

            this._syncPosition();
            this._syncRotation();

            this._duringUpdate = false;
        },

        _folder_: "physics"
    });

    module.exports = PhysicsBody;

    module.exports = PhysicsBody;
});
