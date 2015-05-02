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

    // SceneManager
    var SceneManager = {};



    SceneManager.loadScene = function(path, cb, force) {
        var json = _sceneMap[path];
        var self = this;

        var parseComplete = function(scene){
            if(scene && cb) cb(scene);
        }

        if(json && !force){
            parseData(json, parseComplete);
        } else {
            cc.loader.loadJson(path, function(err, json){
                if(err) throw err;

                _sceneMap[path] = json;
                
                self.parseData(json, parseComplete);
            });
        }
    };

    SceneManager.loadSceneWithContent = function(content, cb) {

        try{
            var json = JSON.parse(content); 

            var parseComplete = function(scene){
                if(scene && cb) cb(scene);
            }

            this.parseData(json, parseComplete);   
        }
        catch(err) {
            throw err;
        }
        
    };

    SceneManager.initPhysics = function(scene, data) {
        scene.physics = data;
        scene.space = cl.space = new cp.Space();

        var space = cl.space ;
        // var staticBody = space.staticBody;

        // var winSize = cc.director.getWinSize();

        // Walls
        // var walls = [ new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(winSize.width,0), 0 ),               // bottom
        //     new cp.SegmentShape( staticBody, cp.v(0,winSize.height), cp.v(winSize.width,winSize.height), 0),    // top
        //     new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(0,winSize.height), 0),             // left
        //     new cp.SegmentShape( staticBody, cp.v(winSize.width,0), cp.v(winSize.width,winSize.height), 0)  // right
        // ];
        // for( var i=0; i < walls.length; i++ ) {
        //     var shape = walls[i];
        //     shape.setElasticity(1);
        //     shape.setFriction(1);
        //     space.addStaticShape( shape );
        // }

        // var body = new cp.Body(1, cp.momentForBox(1, 48, 108) );
        // body.setPos( cl.p(200, 200) );
        // space.addBody( body );
        // var shape = new cp.BoxShape( body, 48, 108);
        // shape.setElasticity( 0.5 );
        // shape.setFriction( 0.5 );
        // space.addShape( shape );

        // Gravity
        space.gravity = cp.v(0, -100);


        var debugNode = new cc.PhysicsDebugNode( space );
        debugNode.visible = true ;

        var parent = scene;
        if(scene.canvas) {
            parent = scene.canvas;
        }
        parent.addChild( debugNode );

        scene.scheduleUpdate();
        scene.update = function( delta ) {
            cl.space.step( delta );
        }

    }

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

            if(data.physics) {
                self.initPhysics(scene, data.physics);
            }

            for(var i=0; i<data.children.length; i++){
                var o = GameObject.fromJSON(data.children[i]);
                parent.addChild(o);
            }

            if(cb) {
                cb(scene);
            }

        }, this);
    };

    module.exports = cl.SceneManager = SceneManager;
});
