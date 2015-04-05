(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    var GameObject = require("../object/GameObject.js");

    var SceneManager = cc.Class.extend({
        ctor : function () {
        	this._sceneMap = {};
        },

        loadScene : function(path, cb, force) {
        	var json = this._sceneMap[path];

        	var parseComplete = function(scene){
    			if(scene && cb) cb(scene);
        	}

        	if(json && !force){
        		this.parseData(json, parseComplete);
        	} else {
                var self = this;
                cc.loader.loadJson(path, function(err, json){
                    if(err) throw err;

                    self._sceneMap[path] = json;
                    
                    self.parseData(json, parseComplete);
                });
            }
        },

        parseData : function(json, cb){
        	var data = json.root;
        	var self = this;

        	cc.LoaderScene.preload(data.res, function () {
                var resIndex = 0;

                function loadResComplete(){
                    if(++resIndex < data.res.length) return;

                    var scene = new cc.Scene();
                    scene.res = data.res;
                    for(var i=0; i<data.children.length; i++){
                        self.parseGameObject(scene, data.children[i]);
                    }

                    if(cb) cb(scene)
                }

                for(var i=0; i<data.res.length; i++){
                    cc.textureCache.addImage(data.res[i], loadResComplete);
                }

            }, this);
        },

        parseGameObject : function(parent, data){
        	var o = new GameObject();
        	parent.addChild(o);

        	for(var i=0; i<data.components.length; i++){
        		this.parseComponent(o, data.components[i]);
        	}

        	if(data.children){
    	    	for(var i=0; i<data.children.length; i++){
    	    		this.parseGameObject(o, data.children[i]);
    	    	}
        	}
        	
        	return o;
        },

        parseComponent: function(parent, data){
        	var c = parent.addComponent(data.class);
            if(c == null) return null;
            
        	for(var k in data){
        		if(k == "class") continue;

        		c[k] = data[k];
        	}

        	return c;
        }
    });

    module.exports = cl.SceneManager = new SceneManager;
});
