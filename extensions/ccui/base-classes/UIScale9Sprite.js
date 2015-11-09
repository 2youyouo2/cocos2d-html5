/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2012 Neofect. All rights reserved.

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

 Created by Jung Sang-Taik on 2012-03-16
 ****************************************************************************/

EventTarget = require("../cocos2d/core/event/event-target");

/**
 * <p>
 * A 9-slice sprite for cocos2d UI.                                                                    <br/>
 *                                                                                                     <br/>
 * 9-slice scaling allows you to specify how scaling is applied                                        <br/>
 * to specific areas of a sprite. With 9-slice scaling (3x3 grid),                                     <br/>
 * you can ensure that the sprite does not become distorted when                                       <br/>
 * scaled.                                                                                             <br/>
 * @note: it will refactor in v3.1                                                                    <br/>
 * @see http://yannickloriot.com/library/ios/cccontrolextension/Classes/CCScale9Sprite.html            <br/>
 * </p>
 * @class
 * @extends cc.Node
 *
 * @property {cc.Size}  preferredSize   - The preferred size of the 9-slice sprite
 * @property {cc.Rect}  capInsets       - The cap insets of the 9-slice sprite
 * @property {Number}   insetLeft       - The left inset of the 9-slice sprite
 * @property {Number}   insetTop        - The top inset of the 9-slice sprite
 * @property {Number}   insetRight      - The right inset of the 9-slice sprite
 * @property {Number}   insetBottom     - The bottom inset of the 9-slice sprite
 */

ccui.Scale9Sprite = cc.Scale9Sprite = cc.Node.extend(/** @lends ccui.Scale9Sprite# */{
    _spritesGenerated:false,
    _spriteRect: null,
    _spriteFrameRotated:false,
    _capInsetsInternal:null,

    _scale9Image: null, //the original sprite

    _scale9Enabled: true,
    _blendFunc:null,

    /** Original sprite's size. */
    _originalSize:null,
    /** Preferred sprite's size. By default the preferred size is the original size. */

    //if the preferredSize component is given as -1, it is ignored
    _preferredSize:null,

    /** Sets the left side inset */
    _insetLeft: 0.0,
    /** Sets the top side inset */
    _insetTop:0.0,
    /** Sets the right side inset */
    _insetRight:0.0,
    /** Sets the bottom side inset */
    _insetBottom:0.0,

    _flippedX: false,
    _flippedY: false,
    _isPatch9: false,
    _brightState: 0,
    _nonSliceSpriteAnchor: null,
    _textureLoaded:false,

    _quads:[],
    _quadsDirty : true,

    ctor: function(file, rect, capInsets) {
        var self = this;
        cc.Node.prototype.ctor.call(self);
        this._nonSliceSpriteAnchor = cc.p(0.5,0.5);
        this._originalSize = cc.size(0,0);
        this._preferredSize = cc.rect(0,0,0,0);
        this._spriteRect = cc.rect(0,0,0,0);
        this._capInsetsInternal = cc.rect(0,0,0,0);
        this._blendFunc = cc.BlendFunc._disable();
        this.setAnchorPoint(cc.p(0.5,0.5));

        if(file != undefined)
        {
            if(file instanceof cc.SpriteFrame) {
                this.initWithSpriteFrame(file, rect);
            }
            else{
                var frame = cc.spriteFrameCache.getSpriteFrame(file);
                if(frame != null){
                    this.initWithSpriteFrame(frame, rect);
                }
                else
                    this.initWithFile(file,rect,capInsets);
            }
        }
        else
        {
            this.init();
        }
    },

    textureLoaded:function(){
        return this._textureLoaded;
    },

    /**
     * Initializes a 9-slice sprite with a texture file, a delimitation zone and
     * with the specified cap insets.
     * Once the sprite is created, you can then call its "setContentSize:" method
     * to resize the sprite will all it's 9-slice goodness intract.
     * It respects the anchorPoint too.
     *
     * @param file The name of the texture file.
     * @param rect The rectangle that describes the sub-part of the texture that
     * is the whole image. If the shape is the whole texture, set this to the
     * texture's full rect.
     * @param capInsets The values to use for the cap insets.
     * @return True if initialize success, false otherwise.
     */
    initWithFile : function(file, rect, capInsets){
        if(file instanceof cc.Rect) {
            capInsets = file;
            file = rect;
        }
        rect = rect || cc.rect(0,0,0,0);
        capInsets = capInsets || cc.rect(0,0,0,0);

        if(!file){
            throw new Error("ccui.Scale9Sprite.initWithFile(): file should be non-null");
        }

        var sprite = cc.Sprite.create(file,rect);

        this.init(sprite, rect, capInsets);
    },

    /**
     * Initializes a 9-slice sprite with an sprite frame and with the specified
     * cap insets.
     * Once the sprite is created, you can then call its "setContentSize:" method
     * to resize the sprite will all it's 9-slice goodness intract.
     * It respects the anchorPoint too.
     *
     * @param spriteFrame The sprite frame object.
     * @param capInsets The values to use for the cap insets.
     * @return True if initializes success, false otherwise.
     */
    initWithSpriteFrame : function(spriteFrame, capInsets){
        if(!spriteFrame || !spriteFrame.getTexture())
            throw new Error("ccui.Scale9Sprite.initWithSpriteFrame(): spriteFrame should be non-null and its texture should be non-null");

        capInsets = capInsets || cc.rect(0,0,0,0);

        var locLoaded = spriteFrame.textureLoaded();

        this._capInsetsInternal = capInsets;
        this._textureLoaded = false;
        var ontextureLoadedCallback = function () {
            this._spriteFrameRotated = spriteFrame.isRotated();
            this._textureLoaded = true;
            var sprite = cc.Sprite.createWithSpriteFrame(spriteFrame);
            var opacity = this.getOpacity();
            var color = this.getColor();
            this._updateBlendFunc(sprite.getTexture());
            this._scale9Image = sprite;
            if (!this._scale9Enabled) {
                this.addChild(this._scale9Image);
                this._adjustScale9ImagePosition();
            }
            this._scale9Image.setAnchorPoint(cc.p(0,0));
            this._scale9Image.setPosition(cc.p(0,0));

            if(this._spriteRect.equals(cc.rect(0,0,0,0))) {
                this._spriteRect = cc.rect(spriteFrame.getRect());
            }

            if(cc.sizeEqualToSize(this._originalSize, cc.size(0,0))) {
                this._originalSize = cc.size(spriteFrame.getOriginalSize());
            }
            if(cc.sizeEqualToSize(this._preferredSize, cc.size(0,0))) {
                this.setPreferredSize(this._originalSize);
            }
            //
            this._applyBlendFunc();
            this.setState(this._brightState);
            if (this._spritesGenerated)
            {
                // Restore color and opacity
                this.setOpacity(opacity);
                this.setColor(color);
            }
            this._spritesGenerated = true;
            //notify quads need to be rebuild
            this._quadsDirty = true;
        };

        if (!locLoaded) {

            spriteFrame.addEventListener("load", ontextureLoadedCallback, this);
        }
        else {
            ontextureLoadedCallback.call(this);
        }
    },

    /**
     * Initializes a 9-slice sprite with an sprite frame name and with the specified
     * cap insets.
     * Once the sprite is created, you can then call its "setContentSize:" method
     * to resize the sprite will all it's 9-slice goodness intract.
     * It respects the anchorPoint too.
     *
     * @param spriteFrameName The sprite frame name.
     * @param capInsets The values to use for the cap insets.
     * @return True if initializes success, false otherwise.
     */
    initWithSpriteFrameName : function(spriteFrameName, capInsets){
        if(!spriteFrameName)
            throw new Error("ccui.Scale9Sprite.initWithSpriteFrameName(): spriteFrameName should be non-null");
        capInsets = capInsets || cc.rect(0, 0, 0, 0);

        var frame = cc.spriteFrameCache.getSpriteFrame(spriteFrameName);

        if (frame == null) {
            cc.log("ccui.Scale9Sprite.initWithSpriteFrameName(): can't find the sprite frame by spriteFrameName");
            return false;
        }

        return this.initWithSpriteFrame(frame, capInsets);
    },

    /**
     * @brief Initializes a 9-slice sprite with an sprite instance.
     * Once the sprite is created, you can then call its "setContentSize:" method
     * to resize the sprite will all it's 9-slice goodness intract.
     * It respects the anchorPoint too.
     *
     * @param sprite The sprite instance.
     * @param rect A delimitation zone.
     * @param rotated Whether the sprite is rotated or not.
     * @param offset The offset when slice the sprite.
     * @param originalSize The original size of sprite.
     * @param capInsets The values to use for the cap insets.
     * @return True if initializes success, false otherwise.
     */
    init : function(sprite,rect,rotated,offset,originalSize,capInsets){
        if(sprite == null) return true;

        sprite = sprite || null;
        rect = rect || cc.rect(0,0,0,0);
        rotated = rotated || false;
        offset = offset || cc.p(0,0);
        originalSize = originalSize || cc.size(rect.width, rect.height);
        capInsets = capInsets || cc.rect(0,0,0,0);

        if(rotated instanceof cc.Rect)
        {
            capInsets = arguments[2];
            rotated = false;
        }
        if(offset instanceof  cc.Rect)
        {
            capInsets = arguments[3];
            offset = cc.p(0,0);
        }

        this.updateWithSprite(sprite, rect, rotated, offset, originalSize, capInsets);

        return true;
    },

    /**
     * Sets the source blending function.
     *
     * @param blendFunc A structure with source and destination factor to specify pixel arithmetic. e.g. {GL_ONE, GL_ONE}, {GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA}.
     * @js NA
     * @lua NA
     */
    setBlendFunc : function(blendFunc){
        this._blendFunc.src = blendFunc.src;
        this._blendFunc.dst = blendFunc.dst;
        this._applyBlendFunc();
    },

    /**
     * Returns the blending function that is currently being used.
     *
     * @return A BlendFunc structure with source and destination factor which specified pixel arithmetic.
     * @js NA
     * @lua NA
     */
    getBlendFunc : function(){
        return cc.BlendFunc(this._blendFunc.src, this._blendFunc.dst);
    },

    /**
     * Creates and returns a new sprite object with the specified cap insets.
     * You use this method to add cap insets to a sprite or to change the existing
     * cap insets of a sprite. In both cases, you get back a new image and the
     * original sprite remains untouched.
     *
     * @param capInsets The values to use for the cap insets.
     * @return A Scale9Sprite instance.
     */
    resizableSpriteWithCapInsets : function(capInsets){
        result = new cc.Scale9Sprite();
        result.init(this._scale9Image, this._spriteRect, this._spriteFrameRotated, cc.rect(0,0,0,0), this._originalSize, capInsets);
        return result;
    },


    /**
     * @brief Update Scale9Sprite with a specified sprite.
     *
     * @param sprite A sprite pointer.
     * @param rect A delimitation zone.
     * @param rotated Whether the sprite is rotated or not.
     * @param offset The offset when slice the sprite.
     * @param originalSize The origial size of the sprite.
     * @param capInsets The Values to use for the cap insets.
     * @return True if update success, false otherwise.
     * @js NA
     */
    updateWithSprite : function(sprite,textureRect,rotated,offset,originalSize,capInsets) {
        if (offset instanceof cc.Rect) {
            capInsets = arguments[3];
            offset = cc.size(0, 0);
            originalSize = cc.size(textureRect.width, textureRect.height);
        }

        this._spriteRect = cc.rect(textureRect);
        this._spriteFrameRotated = rotated;
        this._originalSize = originalSize;
        this._capInsetsInternal = capInsets;
        this._textureLoaded = false;

        if(sprite == null){
            this._quadsDirty = true;
            return true;
        }

        var textureloaded = sprite.textureLoaded();
        var onLoadedCallBack = function() {
            //do
            this._textureLoaded = true;
            var opacity = this.getOpacity();
            var color = this.getColor();
            this._updateBlendFunc(sprite.getTexture());
            this._scale9Image = sprite;
            this._scale9Image.setAnchorPoint(cc.p(0,0));
            this._scale9Image.setPosition(cc.p(0,0));
            if(this._spriteRect.equals(cc.rect(0,0,0,0))) {
                var textureSize = this._scale9Image.getTexture().getContentSize();
                this._spriteRect = cc.rect(0,0,textureSize.width,textureSize.height);
            }
            if(cc.sizeEqualToSize(this._originalSize, cc.size(0,0))) {
                this._originalSize = cc.size(this._scale9Image.getTexture().getContentSize());
            }
            if(cc.sizeEqualToSize(this._preferredSize, cc.size(0,0))) {
                this.setPreferredSize(this._originalSize);
            }

            if (!this._scale9Enabled) {
                this.addChild(this._scale9Image);
                this._adjustScale9ImagePosition();
            }

            this._applyBlendFunc();
            this.setState(this._brightState);
            if (this._spritesGenerated)
            {
                // Restore color and opacity
                this.setOpacity(opacity);
                this.setColor(color);
            }
            this._spritesGenerated = true;
            this._quadsDirty = true;
        };

        if(textureloaded) {
            onLoadedCallBack.call(this);
        }
        else {
            var texture = sprite.getTexture();
            if(texture)
                texture.addEventListener("load",onLoadedCallBack, this);
        }

        return true;

    },


    /**
     * @brief Change inner sprite's sprite frame.
     *
     * @param spriteFrame A sprite frame pointer.
     * @param capInsets The values to use for the cap insets.
     */
    setSpriteFrame : function(spriteFrame, capInsets){
        var sprite = cc.sprite.createWithTexture(spriteFrame.getTexture());
        this.updateWithSprite(sprite,
            spriteFrame.getRect(),
            spriteFrame.isRotated(),
            spriteFrame.getOffset(),
            spriteFrame.getOriginalSize(),
            capInsets);

        // Reset insets
        this._insetLeft = capInsets.origin.x;
        this._insetTop = capInsets.origin.y;
        this._insetRight = this._originalSize.width - this._insetLeft - capInsets.size.width;
        this._insetBottom = this._originalSize.height - this._insetTop - capInsets.size.height;
    },

    // overrides
    setContentSize : function(size){
        if (cc.sizeEqualToSize(this._contentSize,size))
        {
            return;
        }
        cc.Node.prototype.setContentSize.call(this, size);
        this._preferredSize = size;
        this._quadsDirty = true;
        this._adjustScale9ImagePosition();
    },

    setAnchorPoint : function(anchorPoint){
        cc.Node.prototype.setAnchorPoint.call(this, anchorPoint);
        if (!this._scale9Enabled)
        {
            if (this._scale9Image != null)
            {
                this._nonSliceSpriteAnchor = anchorPoint;
                this._scale9Image.setAnchorPoint(anchorPoint);
                this._adjustScale9ImagePosition();
            }
        }
    },

    /**
     * Change the state of 9-slice sprite.
     * @see `State`
     * @param state A enum value in State.
     * @since v3.4
     */
    setState : function(state){
        this._brightState = state;
        this._renderCmd.setState(state);
    },

    /**
     * Query the current bright state.
     * @return @see `State`
     * @since v3.7
     */
    getState : function(){
        return this._brightState;
    },

    /**
     * @brief Query the sprite's original size.
     *
     * @return Sprite size.
     */
    getOriginalSize : function(){
        return cc.size(this._originalSize);
    },

    /**
     * @brief Change the preferred size of Scale9Sprite.
     *
     * @param size A delimitation zone.
     */
    setPreferredSize : function(size)
    {
        return this.setContentSize(size);
    },

    /**
     * @brief Query the Scale9Sprite's preferred size.
     *
     * @return Scale9Sprite's preferred size.
     */
    getPreferredSize : function(){
        return cc.size(this._preferredSize);
    },

    /**
     * @brief Change the cap inset size.
     *
     * @param rect A delimitation zone.
     */
    setCapInsets : function(capInsets){
        this._quadsDirty = true;
        this._capInsetsInternal = capInsets;
        this._insetLeft = capInsets.origin.x;
        this._insetTop = capInsets.origin.y;
        this._insetRight = this._originalSize.width - this._insetLeft - capInsets.size.width;
        this._insetBottom = this._originalSize.height - this._insetTop - capInsets.size.height;
    },

    /**
     * @brief Query the Scale9Sprite's preferred size.
     *
     * @return Scale9Sprite's cap inset.
     */
    getCapInsets : function(){
        return cc.rect(this._capInsetsInternal);
    },

    /**
     * @brief Change the left sprite's cap inset.
     *
     * @param leftInset The values to use for the cap inset.
     */
    setInsetLeft : function(insetLeft){
        this._insetLeft = insetLeft;
        this._updateCapInset();
    },

    /**
     * @brief Query the left sprite's cap inset.
     *
     * @return The left sprite's cap inset.
     */
    getInsetLeft : function(){
        return this._insetLeft;
    },

    /**
     * @brief Change the top sprite's cap inset.
     *
     * @param topInset The values to use for the cap inset.
     */
    setInsetTop : function(insetTop){
        this._insetTop = insetTop;
        this._updateCapInset();
    },

    /**
     * @brief Query the top sprite's cap inset.
     *
     * @return The top sprite's cap inset.
     */
    getInsetTop : function(){
        return this._insetTop;
    },

    /**
     * @brief Change the right sprite's cap inset.
     *
     * @param rightInset The values to use for the cap inset.
     */
    setInsetRight : function(insetRight){
        this._insetRight = insetRight;
        this._updateCapInset();
    },

    /**
     * @brief Query the right sprite's cap inset.
     *
     * @return The right sprite's cap inset.
     */
    getInsetRight : function(){
        return this._insetRight;
    },

    /**
     * @brief Change the bottom sprite's cap inset.
     *
     * @param bottomInset The values to use for the cap inset.

     */
    setInsetBottom : function(insetBottom)
    {
        this._insetBottom = insetBottom;
        this._updateCapInset();
    },

    /**
     * @brief Query the bottom sprite's cap inset.
     *
     * @return The bottom sprite's cap inset.
     */
    getInsetBottom : function(){
        return this._insetBottom;
    },

    /**
     * @brief Toggle 9-slice feature.
     * If Scale9Sprite is 9-slice disabled, the Scale9Sprite will rendered as a normal sprite.
     * @param enabled True to enable 9-slice, false otherwise.
     * @js NA
     */
    setScale9Enabled : function(enabled){
        if (this._scale9Enabled == enabled) {
            return;
        }
        this._scale9Enabled = enabled;
        if(this._scale9Image) {
            if (!this._scale9Enabled) {
                this.addChild(this._scale9Image);
                this._adjustScale9ImagePosition();
            }
            else {
                this.removeChild(this._scale9Image);
            }

        }

        this._quadsDirty = true;

        //we must invalide the transform when toggling scale9enabled
        //this._transformUpdated = this._transformDirty = this._inverseDirty = true;
        //
        //if (this._scale9Enabled)
        //{
        //    if (this._scale9Image)
        //    {
        //        this.updateWithSprite(this._scale9Image,
        //            this._spriteRect,
        //            this._spriteFrameRotated,
        //            cc.p(0,0),
        //            this._originalSize,
        //            this._capInsetsInternal);
        //    }
        //}
        //else
        //{
        //    if (this._scale9Image)
        //    {
        //        //todo verify this code
        //        //var quad = this._scale9Image->getQuad();
        //        //PolygonInfo polyInfo;
        //        //polyInfo.setQuad(&quad);
        //        //_scale9Image->setPolygonInfo(polyInfo);
        //    }
        //
        //}
        //
        //this._adjustScale9ImagePosition();
    },

    /**
     * @brief Query whether the Scale9Sprite is enable 9-slice or not.
     *
     * @return True if 9-slice is enabled, false otherwise.
     * @js NA
     */
    isScale9Enabled : function(){
        return this._scale9Enabled;
    },

    /**
     * @brief Get the original no 9-sliced sprite
     *
     * @return A sprite instance.
     */
    getSprite : function(){
        return this._scale9Image;
    },

    /**
     * Sets whether the widget should be flipped horizontally or not.
     *
     * @param flippedX true if the widget should be flipped horizontally, false otherwise.
     */
    setFlippedX : function(flippedX){
        var realScale = this.getScaleX();
        this._flippedX = flippedX;
        this.setScaleX(realScale);
    },

    /**
     * Returns the flag which indicates whether the widget is flipped horizontally or not.
     *
     * It only flips the texture of the widget, and not the texture of the widget's children.
     * Also, flipping the texture doesn't alter the anchorPoint.
     * If you want to flip the anchorPoint too, and/or to flip the children too use:
     * widget->setScaleX(sprite->getScaleX() * -1);
     *
     * @return true if the widget is flipped horizontally, false otherwise.
     */
    isFlippedX: function() {
        return this._flippedX;
    },

    /**
     * Sets whether the widget should be flipped vertically or not.
     *
     * @param flippedY true if the widget should be flipped vertically, false otherwise.
     */
    setFlippedY : function(flippedY){
        var realScale = this.getScaleY();
        this._flippedY = flippedY;
        this.setScaleY(realScale);
    },

    /**
     * Return the flag which indicates whether the widget is flipped vertically or not.
     *
     * It only flips the texture of the widget, and not the texture of the widget's children.
     * Also, flipping the texture doesn't alter the anchorPoint.
     * If you want to flip the anchorPoint too, and/or to flip the children too use:
     * widget->setScaleY(widget->getScaleY() * -1);
     *
     * @return true if the widget is flipped vertically, false otherwise.
     */
    isFlippedY : function(){
        return this._flippedY;
    },

    //override the setScale function of Node
    setScaleX : function(scaleX){
        if (this._flippedX) {
            scaleX = scaleX * -1;
        }
        cc.Node.prototype.setScaleX.call(this,scaleX);
    },

    setScaleY : function(scaleY){
        if (this._flippedY) {
            scaleY = scaleY * -1;
        }
        cc.Node.prototype.setScaleY.call(this,scaleY);
    },

    setScale : function(scale){
        this.setScaleX(scale);
        this.setScaleY(scale);
    },

    setScale : function(scaleX, scaleY){
        this.setScaleX(scaleX);
        this.setScaleY(scaleY);
    },

    getScaleX : function(){
        var originalScale = cc.Node.prototype.getScaleX.call(this);
        if (this._flippedX)
        {
            originalScale = originalScale * -1.0;
        }
        return originalScale;
    },

    getScaleY : function() {
        var originalScale = cc.Node.prototype.getScaleY.call(this);
        if (this._flippedY)
        {
            originalScale = originalScale * -1.0;
        }
        return originalScale;
    },

    getScale : function(){

        return this.getScaleX();
    },

    setCameraMask : function(mask,applyChildren/** = true**/){
        cc.Node.prototype.setCameraMask.call(this,mask,applyChildren);
        if(this._scale9Image)
            this._scale9Image.setCameraMask(mask,applyChildren);
    },

    _updateCapInset : function() {
        var insets = cc.rect(this._insetLeft,
            this._insetTop,
            this._originalSize.width-this._insetLeft-this._insetRight,
            this._originalSize.height-this._insetTop-this._insetBottom);
        this.setCapInsets(insets);
    },

    _adjustScale9ImagePosition : function(){
        if (this._scale9Image)
        {
            if (!this._scale9Enabled) {
                this._scale9Image.setAnchorPoint(this._nonSliceSpriteAnchor);
                this._scale9Image.setPosition(this._contentSize.width * this._scale9Image.getAnchorPoint().x,
                    this._contentSize.height * this._scale9Image.getAnchorPoint().y);

            }
        }
    },

    _applyBlendFunc : function(){
        if(this._scale9Image != null)
            this._scale9Image.setBlendFunc(this._blendFunc);
    },

    _updateBlendFunc : function(texture){
        if (! texture || ! texture.hasPremultipliedAlpha())
        {
            this._blendFunc = cc.BlendFunc._alphaNonPremultiplied();
            this.setOpacityModifyRGB(false);
        }
        else
        {
            this._blendFunc = cc.BlendFunc._alphaPremultiplied();
            this.setOpacityModifyRGB(true);
        }
    },

    //calculate the quads used for scale 9 rendering.

    _createSlicedSprites : function(){
        if (this._scale9Enabled)
        {
            var tex = null;
            if(this._scale9Image != null)
            {
                tex = this._scale9Image.getTexture();
            }

            if (tex == null)
            {
                return;
            }

            var capInsets = cc.rectPointsToPixels(this._capInsetsInternal);
            var textureRect = cc.rectPointsToPixels(this._spriteRect);
            var spriteRectSize = cc.sizePointsToPixels(this._originalSize);

            //handle .9.png
            if (this._isPatch9)
            {
                spriteRectSize = cc.size(spriteRectSize.width - 2, spriteRectSize.height-2);
            }

            if(capInsets.equals(cc.rect(0,0,0,0)))
            {
                capInsets = cc.rect(spriteRectSize.width/3, spriteRectSize.height/3,
                    spriteRectSize.width/3, spriteRectSize.height/3);
            }
            //

            this._calculateQuads(this._calculateUV(tex, capInsets, spriteRectSize),
                this._calculateVertices(capInsets, spriteRectSize));
        }
    },

    _cleanupSlicedSprites : function(){
        this._quads = [];
    },

    _calculateUV : function(texture, capInsets, spriteRectSize){
        var atlasWidth = texture.getPixelsWide();
        var atlasHeight = texture.getPixelsHigh();

        //caculate texture coordinate
        var leftWidth = 0, centerWidth = 0, rightWidth = 0;
        var topHeight = 0, centerHeight = 0, bottomHeight = 0;

        if (this._spriteFrameRotated)
        {
            rightWidth = capInsets.y;
            centerWidth = capInsets.height;
            leftWidth = spriteRectSize.height - centerWidth - rightWidth;

            topHeight = capInsets.x;
            centerHeight = capInsets.width;
            bottomHeight = spriteRectSize.width - (topHeight + centerHeight);
        }
        else
        {
            leftWidth = capInsets.x;
            centerWidth = capInsets.width;
            rightWidth = spriteRectSize.width - (leftWidth + centerWidth);

            topHeight = capInsets.y;
            centerHeight = capInsets.height;
            bottomHeight =spriteRectSize.height - (topHeight + centerHeight);
        }

        var textureRect = cc.rectPointsToPixels(this._spriteRect);
        //handle .9.png
        if (this._isPatch9)
        {
            //This magic number is used to avoiding artifact with .9.png format.
            var offset = 1.3;
            textureRect = cc.rect(textureRect.origin.x +  offset,
                textureRect.origin.y +  offset,
                textureRect.size.width - 2,
                textureRect.size.height - 2);
        }

        //uv computation should take spritesheet into account.
        var u0, u1, u2, u3;
        var v0, v1, v2, v3;
        if (this._spriteFrameRotated)
        {
            u0 = textureRect.x / atlasWidth;
            u1 = (leftWidth + textureRect.x) / atlasWidth;
            u2 = (leftWidth + centerWidth + textureRect.x) / atlasWidth;
            u3 = (textureRect.x + textureRect.height) / atlasWidth;

            v3 = textureRect.y / atlasHeight;
            v2 = (topHeight + textureRect.y) / atlasHeight;
            v1 = (topHeight + centerHeight + textureRect.y) / atlasHeight;
            v0 = (textureRect.y + textureRect.width) / atlasHeight;
        }
        else
        {
            u0 = textureRect.x / atlasWidth;
            u1 = (leftWidth + textureRect.x) / atlasWidth;
            u2 = (leftWidth + centerWidth + textureRect.x) / atlasWidth;
            u3 = (textureRect.x + textureRect.width) / atlasWidth;

            v0 = textureRect.y / atlasHeight;
            v1 = (topHeight + textureRect.y) / atlasHeight;
            v2 = (topHeight + centerHeight + textureRect.y) / atlasHeight;
            v3 = (textureRect.y + textureRect.height) / atlasHeight;
        }

        var uvCoordinates = [];
        uvCoordinates.push(cc.p(u0,v3));
        uvCoordinates.push(cc.p(u1,v2));
        uvCoordinates.push(cc.p(u2,v1));
        uvCoordinates.push(cc.p(u3,v0));

        return uvCoordinates;
    },

    _calculateVertices : function(capInsets,spriteRectSize){
        var leftWidth = 0, centerWidth = 0, rightWidth = 0;
        var topHeight = 0, centerHeight = 0, bottomHeight = 0;

        leftWidth = capInsets.x;
        centerWidth = capInsets.width;
        rightWidth = spriteRectSize.width - (leftWidth + centerWidth);

        topHeight = capInsets.y;
        centerHeight = capInsets.height;
        bottomHeight = spriteRectSize.height - (topHeight + centerHeight);


        leftWidth = leftWidth / cc.contentScaleFactor();
        rightWidth = rightWidth / cc.contentScaleFactor();
        topHeight = topHeight / cc.contentScaleFactor();
        bottomHeight = bottomHeight / cc.contentScaleFactor();
        var preferSize = this.getPreferredSize();
        var sizableWidth = preferSize.width - leftWidth - rightWidth;
        var sizableHeight = preferSize.height - topHeight - bottomHeight;
        var x0,x1,x2,x3;
        var y0,y1,y2,y3;
        if(sizableWidth >= 0)
        {
            x0 = 0;
            x1 = leftWidth;
            x2 = leftWidth + sizableWidth;
            x3 = preferSize.width;
        }
        else
        {
            var xScale = preferSize.width / (leftWidth + rightWidth);
            x0 = 0;
            x1 = x2 = leftWidth * xScale;
            x3 = (leftWidth + rightWidth) * xScale;
        }

        if(sizableHeight >= 0)
        {
            y0 = 0;
            y1 = bottomHeight;
            y2 = bottomHeight + sizableHeight;
            y3 = preferSize.height;
        }
        else
        {
            var yScale = preferSize.height / (topHeight + bottomHeight);
            y0 = 0;
            y1 = y2= bottomHeight * yScale;
            y3 = (bottomHeight + topHeight) * yScale;
        }

        var vertices = [];
        vertices.push(cc.p(x0,y0));
        vertices.push(cc.p(x1,y1));
        vertices.push(cc.p(x2,y2));
        vertices.push(cc.p(x3,y3));

        return vertices;
    },

    _calculateQuads : function(uv, vertices){
        var color = this._scale9Image.getDisplayedColor();
        for(var j = 0; j < 3; ++j) {        //row
            for(var i = 0; i < 3; ++i){     //column
                var quad = new cc.V3F_C4B_T2F_Quad();
                quad._bl.colors = color;
                quad._br.colors = color;
                quad._tl.colors = color;
                quad._tr.colors = color;

                quad._bl.vertices = new cc.Vertex3F(vertices[i].x,vertices[j].y,0);
                quad._br.vertices = new cc.Vertex3F(vertices[i+1].x,vertices[j].y,0);
                quad._tl.vertices = new cc.Vertex3F(vertices[i].x,vertices[j+1].y,0);
                quad._tr.vertices = new cc.Vertex3F(vertices[i+1].x,vertices[j+1].y,0);

                if (this._spriteFrameRotated)
                {
                    quad._bl.texCoords = new cc.Tex2F(uv[j].x,uv[i].y);
                    quad._br.texCoords = new cc.Tex2F(uv[j].x,uv[i+1].y);
                    quad._tl.texCoords = new cc.Tex2F(uv[j+1].x,uv[i].y);
                    quad._tr.texCoords = new cc.Tex2F(uv[i+1].x,uv[j+1].y);
                }
                else
                {
                    quad._bl.texCoords = new cc.Tex2F(uv[i].x,uv[j].y);
                    quad._br.texCoords = new cc.Tex2F(uv[i+1].x,uv[j].y);
                    quad._tl.texCoords = new cc.Tex2F(uv[i].x,uv[j+1].y);
                    quad._tr.texCoords = new cc.Tex2F(uv[i+1].x,uv[j+1].y);
                    
                }
                this._quads.push(quad);
            }
        }
    },

    _createRenderCmd: function(){
        if(cc._renderType === cc.game.RENDER_TYPE_CANVAS)
            return new ccui.Scale9Sprite.CanvasRenderCmd(this);
        else
            return new ccui.Scale9Sprite.WebGLRenderCmd(this);
    },
});

var _p = ccui.Scale9Sprite.prototype;
EventTarget.polyfill(_p);

// Extended properties
/** @expose */
_p.preferredSize;
cc.defineGetterSetter(_p, "preferredSize", _p.getPreferredSize, _p.setPreferredSize);
/** @expose */
_p.capInsets;
cc.defineGetterSetter(_p, "capInsets", _p.getCapInsets, _p.setCapInsets);
/** @expose */
_p.insetLeft;
cc.defineGetterSetter(_p, "insetLeft", _p.getInsetLeft, _p.setInsetLeft);
/** @expose */
_p.insetTop;
cc.defineGetterSetter(_p, "insetTop", _p.getInsetTop, _p.setInsetTop);
/** @expose */
_p.insetRight;
cc.defineGetterSetter(_p, "insetRight", _p.getInsetRight, _p.setInsetRight);
/** @expose */
_p.insetBottom;
cc.defineGetterSetter(_p, "insetBottom", _p.getInsetBottom, _p.setInsetBottom);

_p = null;

/**
 * Creates a 9-slice sprite with a texture file, a delimitation zone and
 * with the specified cap insets.
 * @deprecated since v3.0, please use new ccui.Scale9Sprite(file, rect, capInsets) instead.
 * @param {String|cc.SpriteFrame} file file name of texture or a cc.Sprite object
 * @param {cc.Rect} rect the rect of the texture
 * @param {cc.Rect} capInsets the cap insets of ccui.Scale9Sprite
 * @returns {ccui.Scale9Sprite}
 */
ccui.Scale9Sprite.create = function (file, rect, capInsets) {
    return new ccui.Scale9Sprite(file, rect, capInsets);
};

/**
 * create a ccui.Scale9Sprite with Sprite frame.
 * @deprecated since v3.0, please use "new ccui.Scale9Sprite(spriteFrame, capInsets)" instead.
 * @param {cc.SpriteFrame} spriteFrame
 * @param {cc.Rect} capInsets
 * @returns {ccui.Scale9Sprite}
 */
ccui.Scale9Sprite.createWithSpriteFrame = function (spriteFrame, capInsets) {
    return new ccui.Scale9Sprite(spriteFrame, capInsets);
};

/**
 * create a ccui.Scale9Sprite with a Sprite frame name
 * @deprecated since v3.0, please use "new ccui.Scale9Sprite(spriteFrameName, capInsets)" instead.
 * @param {string} spriteFrameName
 * @param {cc.Rect} capInsets
 * @returns {Scale9Sprite}
 */
ccui.Scale9Sprite.createWithSpriteFrameName = function (spriteFrameName, capInsets) {
    return new ccui.Scale9Sprite(spriteFrameName, capInsets);
};

/**
 * @ignore
 */
ccui.Scale9Sprite.POSITIONS_CENTRE = 0;
ccui.Scale9Sprite.POSITIONS_TOP = 1;
ccui.Scale9Sprite.POSITIONS_LEFT = 2;
ccui.Scale9Sprite.POSITIONS_RIGHT = 3;
ccui.Scale9Sprite.POSITIONS_BOTTOM = 4;
ccui.Scale9Sprite.POSITIONS_TOPRIGHT = 5;
ccui.Scale9Sprite.POSITIONS_TOPLEFT = 6;
ccui.Scale9Sprite.POSITIONS_BOTTOMRIGHT = 7;

ccui.Scale9Sprite.state = {NORMAL: 0, GRAY: 1};
