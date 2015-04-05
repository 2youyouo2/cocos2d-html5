(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
	"use strict";

	require("./cocoslite.js");
    require("./shortcode.js");
    require("./object/GameObject.js");
    require("./object/MeshSprite.js");
    require("./core/SceneManager.js");
    require("./component/Component.js");
    require("./component/ComponentManager.js");
    require("./component/MeshComponent.js");
    require("./component/SpriteComponent.js");
    require("./component/TransformComponent.js");

});
