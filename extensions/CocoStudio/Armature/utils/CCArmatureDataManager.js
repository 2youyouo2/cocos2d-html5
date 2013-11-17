/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * format and manage armature configuration and armature animation
 * @class
 * @extends cc.Class
 */
ccs.ArmatureDataManager = cc.Class.extend({
    _animationDatas:null,
    _armarureDatas:null,
    _textureDatas:null,
    ctor:function () {
        this._animationDatas = {};
        this._armarureDatas = {};
        this._textureDatas = {};
    },
    init:function () {

    },

    /**
     * Add armature data
     * @param {string} id The id of the armature data
     * @param {ccs.ArmatureData} armatureData
     */
    addArmatureData:function (id, armatureData) {
        if (this._armarureDatas) {
            this._armarureDatas[id] = armatureData;
        }
    },

    /**
     * remove armature data
     * @param {string} id
     */
    removeArmatureData:function(id){
        if (this._armarureDatas.hasOwnProperty(id))
           delete this._armarureDatas[id];
    },

    /**
     * get armatureData by id
     * @param {String} id
     * @return {ccs.ArmatureData}
     */
    getArmatureData:function (id) {
        var armatureData = null;
        if (this._armarureDatas) {
            armatureData = this._armarureDatas[id];
        }
        return armatureData;
    },

    /**
     * get armatureDatas
     * @return {Object}
     */
    getArmatureDatas:function () {
        return this._armarureDatas;
    },

    /**
     * add animation data
     * @param {String} id
     * @param {ccs.AnimationData} animationData
     */
    addAnimationData:function (id, animationData) {
        if (this._animationDatas) {
            this._animationDatas[id] = animationData;
        }
    },

    /**
     * remove animation data
     * @param {string} id
     */
    removeAnimationData:function(id){
        if (this._animationDatas.hasOwnProperty(id))
            delete this._animationDatas[id];
    },

    /**
     * get animationData by id
     * @param {String} id
     * @return {ccs.AnimationData}
     */
    getAnimationData:function (id) {
        var animationData = null;
        if (this._animationDatas[id]) {
            animationData = this._animationDatas[id];
        }
        return animationData;
    },

    /**
     * get animationDatas
     * @return {Object}
     */
    getAnimationDatas:function () {
        return this._animationDatas;
    },

    /**
     * add texture data
     * @param {String} id
     * @param {ccs.TextureData} textureData
     */
    addTextureData:function (id, textureData) {
        if (this._textureDatas) {
            this._textureDatas[id] = textureData;
        }
    },

    /**
     * remove texture data
     * @param {string} id
     */
    removeTextureData:function(id){
        if (this._textureDatas.hasOwnProperty(id))
            delete this._textureDatas[id];
    },

    /**
     * get textureData by id
     * @param {String} id
     * @return {ccs.TextureData}
     */
    getTextureData:function (id) {
        var textureData = null;
        if (this._textureDatas) {
            textureData = this._textureDatas[id];
        }
        return textureData;
    },

    /**
     * get textureDatas
     * @return {Object}
     */
    getTextureDatas:function () {
        return this._textureDatas;
    },

    /**
     * Add ArmatureFileInfo, it is managed by CCArmatureDataManager.
     * @param {String} imagePath
     * @param {String} plistPath
     * @param {String} configFilePath
     */
    addArmatureFileInfo:function (/*imagePath,plistPath,configFilePath*/) {
        var imagePath,plistPath,configFilePath;
        var isLoadSpriteFrame = false;
        if (arguments.length == 1) {
            configFilePath = arguments[0];
            isLoadSpriteFrame = true;
        } else if (arguments.length == 3){
            imagePath = arguments[0];
            plistPath = arguments[1];
            configFilePath = arguments[2];
            this.addSpriteFrameFromFile(plistPath, imagePath);
        }
        ccs.DataReaderHelper.addDataFromFile(configFilePath,isLoadSpriteFrame);
    },

    /**
     * Add ArmatureFileInfo, it is managed by CCArmatureDataManager.
     * @param {String} imagePath
     * @param {String} plistPath
     * @param {String} configFilePath
     * @param {Object} target
     * @param {Function} configFilePath
     */
    addArmatureFileInfoAsync:function (/*imagePath, plistPath, configFilePath,target,selector*/) {
        var imagePath, plistPath, configFilePath,target,selector;
        var isLoadSpriteFrame = false;
        if (arguments.length == 3) {
            configFilePath = arguments[0];
            target = arguments[1];
            selector = arguments[2];
            isLoadSpriteFrame = true;
        } else if (arguments.length == 5){
            imagePath = arguments[0];
            plistPath = arguments[1];
            configFilePath = arguments[2];
            target = arguments[3];
            selector = arguments[4];
            this.addSpriteFrameFromFile(plistPath, imagePath);
        }

        ccs.DataReaderHelper.addDataFromFileAsync(configFilePath,target,selector,isLoadSpriteFrame);

    },

    /**
     * Add sprite frame to CCSpriteFrameCache, it will save display name and it's relative image name
     * @param {String} plistPath
     * @param {String} imagePath
     */
    addSpriteFrameFromFile:function (plistPath, imagePath) {
        ccs.SpriteFrameCacheHelper.getInstance().addSpriteFrameFromFile(plistPath, imagePath);
    },

    removeAll:function () {
        this._animationDatas = null;
        this._armarureDatas = null;
        this._textureDatas = null;
        ccs.DataReaderHelper.clear();
    }
});

ccs.ArmatureDataManager._instance = null;
ccs.ArmatureDataManager.getInstance = function () {
    if (!this._instance) {
        this._instance = new ccs.ArmatureDataManager();
        this._instance.init();
    }
    return this._instance;
};
ccs.ArmatureDataManager.purge = function () {
    ccs.SpriteFrameCacheHelper.purge();
    ccs.DataReaderHelper.clear();
    this._instance = null;
};