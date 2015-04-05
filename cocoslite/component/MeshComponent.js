(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var Component = require("./Component.js");

    var MeshComponent = Component.extendComponent("MeshComponent", {
        ctor: function () {
            this._super(this);
            
            // this.properties = ["materials", "subMeshes", "vertices"];

            this._innerMesh = new cl.MeshSprite();
            this._innerMesh.retain();
        },

        _getMaterials: function() {
            return this._innerMesh.materials;
        },
        _setMaterials: function(materials) {
            this._innerMesh.materials = materials;
        },
        toJSONmaterrials: {

        },

        setSubMesh: function(index, indices) {
            this._innerMesh.setSubMesh(index, indices);
        },
        _getSubMeshes: function(index) {
            return this._innerMesh.subMeshes;
        },

        _setVertices: function(vertices) {
            this._innerMesh.vertices = vertices;
        },
        _getVertices: function() {
            return this._innerMesh.vertices;
        },

        rebindVertices: function() {
            return this._innerMesh.rebindVertices();
        },

        hitTest: function(worldPoint) {
            if(!this._innerMesh || !worldPoint) return;

            var p = this._innerMesh.convertToNodeSpace(worldPoint);
            p = cc.p(p);

            var vertices = this.vertices;
            var subMeshes = this.subMeshes;

            for(var i=0; i<subMeshes.length; i++){
                var indices = subMeshes[i];
                for(var j=0; j<indices.length; j+=3){
                    var a = cc.p(vertices[indices[j  ]].vertices);
                    var b = cc.p(vertices[indices[j+1]].vertices);
                    var c = cc.p(vertices[indices[j+2]].vertices);

                    if(a.equal(b) && b.equal(c))
                        continue;

                    if(p.inTriangle(a,b,c))
                        return true;
                }
            }

            return false;
        },

        onBind: function(target) {
            target.addChild(this._innerMesh);
        }
    });

    var _p = MeshComponent.prototype;
    MeshComponent.editorDir = "Mesh";

    cl.defineGetterSetter(_p, "materials", "_getMaterials", "_setMaterials");
    cl.defineGetterSetter(_p, "vertices", "_getVertices", "_setVertices");
    cl.defineGetterSetter(_p, "subMeshes", "_getSubMeshes");

    exports.Component = MeshComponent;
});

