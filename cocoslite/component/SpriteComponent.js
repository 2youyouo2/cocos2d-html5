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
            this.properties = ["file", "anchorPoint"];
            
            this._texture = "";
            this._anchorPoint = new cl.p(0.5, 0.5);
            
            this._super(this);
        },

        _setFile: function(file){
            this._file = file;
            this._updateTexture();
        },
        _getFile: function(){
            return this._file;
        },

        _getAnchorPoint: function(){
            return this._anchorPoint;
        },
        _setAnchorPoint: function(val){
            this._anchorPoint = cl.p(val);
            if(this._innerSprite){
                this._innerSprite.setAnchorPoint(val);
            }
        },

        _updateTexture : function(){
            if(this._file == "" && this._innerSprite){
                this._innerSprite.removeFromParent();
            }

            if(this._file != ""){
                if(!this._innerSprite){
                    this._innerSprite = new cc.Sprite();
                    this._innerSprite.setAnchorPoint(this._anchorPoint);
                    if(this._target)
                        this._target.addChild(this._innerSprite);
                }
                this._innerSprite.setTexture(this._file);
            }
        },

        _getBoundingBox: function(){
            return this._innerSprite.getBoundingBoxToWorld();
        },

        hitTest: function(worldPoint){
            if(!this._innerSprite || !worldPoint) return;

            var p = this._innerSprite.convertToNodeSpace(worldPoint);
            var s = this._innerSprite.getContentSize();
            var rect = cc.rect(0, 0, s.width, s.height);

            return cc.rectContainsPoint(rect, p);
        }
    });

    var _p = SpriteComponent.prototype;
    SpriteComponent.editorDir = "Sprite";

    cl.defineGetterSetter(_p, "file", "_getFile", "_setFile");
    cl.defineGetterSetter(_p, "anchorPoint", "_getAnchorPoint", "_setAnchorPoint");
    cl.defineGetterSetter(_p, "boundingBox", "_getBoundingBox", null);

    exports.Component = SpriteComponent;
});
