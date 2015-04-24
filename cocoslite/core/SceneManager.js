(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    var GameObject = require("./GameObject.js");

    // private
    var _sceneMap = {};
    var _deserializeFuncs = [];

    // SceneManager
    var SceneManager = {};

    SceneManager.registerDeserialize = function(func) {
        _deserializeFuncs.push(func);
    };

    SceneManager.tryReviver = function(key, value) {
        var funcs = _deserializeFuncs;
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
    };

    SceneManager.loadScene = function(path, cb, force) {
        var json = _sceneMap[path];

        var parseComplete = function(scene){
            if(scene && cb) cb(scene);
        }

        if(json && !force){
            parseData(json, parseComplete);
        } else {
            cc.loader.loadJson(path, function(err, json){
                if(err) throw err;

                _sceneMap[path] = json;
                
                this.parseData(json, parseComplete);
            }, this.tryReviver);
        }
    };

    SceneManager.loadSceneWithContent = function(content, cb) {

        try{
            var json = JSON.parse(content, this.tryReviver); 

            var parseComplete = function(scene){
                if(scene && cb) cb(scene);
            }

            this.parseData(json, parseComplete);   
        }
        catch(err) {
            throw err;
        }
        
    };

    SceneManager.parseData = function(json, cb){
        var data = json.root;
        var self = this;

        cc.LoaderScene.preload(data.res, function () {

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

        }, this);
    };

    SceneManager.parseGameObject = function(parent, data) {
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
    };

    SceneManager.parseComponent = function(parent, data) {
        var c = parent.addComponent(data.class);
        if(c == null) return null;
        
        for(var k in data) {
            if(k == "class") continue;
            
            c[k] = data[k];
        }

        return c;
    };

    var stringParsers = [
        {
            re: /#?([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
            parse: function(execResult) {
                return cc.color(execResult[0]);
            }
        },
        {
            re: /cl.Enum.(\w*)+\.(\w*)+/,
            parse: function(execResult) {
                return cl.Enum[execResult[1]][execResult[2]];
            }
        }
    ];

    // register default reviver
    SceneManager.registerDeserialize(function(key, value) {

        var ret = null;

        if(typeof value === 'string') {

            stringParsers.forEach(function(parser) {
                var match = parser.re.exec(value);

                if(match) {
                    ret = parser.parse(match);
                }
            });
        }

        return ret;
    });

    module.exports = cl.SceneManager = SceneManager;
});
