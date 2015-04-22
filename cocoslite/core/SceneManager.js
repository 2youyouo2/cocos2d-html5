(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    var GameObject = require("./GameObject.js");

    var SceneManager = cc.Class.extend({
        ctor : function () {
        	this._sceneMap = {};
            this._deserializeFuncs = [];
        },

        registerDeserialize: function(func) {
            this._deserializeFuncs.push(func);
        },

        tryReviver: function(key, value) {
            var funcs = this._deserializeFuncs;
            for(var i=0; i<funcs.length; i++) {
                var ret;
                try {
                    ret = funcs[i](key, value);
                }
                catch(e) {
                    console.log("SceneManager.tryReviver for [%s]failed : ", key, e);
                }
                
                if(ret) {
                    return ret;
                }
            }

            return value;
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
                }, this.tryReviver.bind(this));
            }
        },

        loadSceneWithContent: function(content, cb) {

            try{
                var json = JSON.parse(content, this.tryReviver.bind(this)); 

                var parseComplete = function(scene){
                    if(scene && cb) cb(scene);
                }

                this.parseData(json, parseComplete);   
            }
            catch(err) {
                throw err;
            }
            
        },

        parseData : function(json, cb){
        	var data = json.root;
        	var self = this;

        	cc.LoaderScene.preload(data.res, function () {
                // var resIndex = 0;

                // function loadResComplete(){
                    // if(++resIndex < data.res.length) return;

                    var scene = new cc.Scene();
                    scene.res = data.res;

                    var parent = scene;
                    if(cl.createCanvas) {
                        parent = cl.createCanvas(scene, data.canvas);
                    }

                    for(var i=0; i<data.children.length; i++){
                        self.parseGameObject(parent, data.children[i]);
                    }

                    if(cb) {
                        cb(scene);
                    }
                // }

                // for(var i=0; i<data.res.length; i++){
                //     cc.textureCache.addImage(data.res[i], loadResComplete);
                // }

            }, this);
        },

        parseGameObject : function(parent, data) {
        	var o = new GameObject();
        	parent.addChild(o);

        	for(var i=0; i<data.components.length; i++) {
        		this.parseComponent(o, data.components[i]);
        	}

        	if(data.children) {
    	    	for(var i=0; i<data.children.length; i++){
    	    		this.parseGameObject(o, data.children[i]);
    	    	}
        	}

        	return o;
        },

        parseComponent: function(parent, data) {
        	var c = parent.addComponent(data.class);
            if(c == null) return null;
            
        	for(var k in data) {
        		if(k == "class") continue;
                
        		c[k] = data[k];
        	}

        	return c;
        }
    });

    var manager = new SceneManager;

    manager.registerDeserialize(function(key, value) {
        var head = 'cl.Enum.';

        if(typeof value === 'string' && value.indexOf(head) === 0) {
            var ret = value.split('.');
            return cl.Enum[ret[2]][ret[3]];
        }

        return null;
    });

    module.exports = cl.SceneManager = manager;
});
