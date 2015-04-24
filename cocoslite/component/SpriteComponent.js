(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var Component = require("./Component.js");

    var SpriteComponent = Component.extendComponent("SpriteComponent", {
        ctor: function () {
            
            this._anchorPoint = new cl.p(0.5, 0.5);
            this._innerSprite = new cc.Sprite();
            
            this._super(["sprite", "anchorPoint"]);
        },

        _setSprite: function(file) {
            this._innerSprite.initWithFile(file);
        },
        _getSprite: function(){
            return this._innerSprite;
        },

        _getAnchorPoint: function(){
            return this._anchorPoint;
        },
        _setAnchorPoint: function(val){
            this._anchorPoint = cl.p(val);
            this._innerSprite.setAnchorPoint(val);
        },

        _getBoundingBox: function(){
            return this._innerSprite.getBoundingBoxToWorld();
        },

        onBind: function(target) {
            target.addChild(this._innerSprite);
        },
        onUnbind: function(target){
            target.removeChild(this._innerSprite);
        },

        hitTest: function(worldPoint){
            if(!this._innerSprite || !worldPoint) return;

            var p = this._innerSprite.convertToNodeSpace(worldPoint);
            var s = this._innerSprite.getContentSize();
            var rect = cc.rect(0, 0, s.width, s.height);

            return cc.rectContainsPoint(rect, p);
        },

        _folder_: "base"
    });

    var _p = SpriteComponent.prototype;
    SpriteComponent.editorDir = "Sprite";

    cl.defineGetterSetter(_p, "sprite", "_getSprite", "_setSprite");
    cl.defineGetterSetter(_p, "anchorPoint", "_getAnchorPoint", "_setAnchorPoint");
    cl.defineGetterSetter(_p, "boundingBox", "_getBoundingBox", null);

    exports.Component = SpriteComponent;
});
