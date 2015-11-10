/**
 * @module cc
 */

var JS = cc.js;
var Playable = require('./playable');

var WrapModeMask = {
    Loop: 1 << 1,
    ShouldWrap: 1 << 2,
    // Reserved: 1 << 3,
    PingPong: 1 << 4 | 1 << 1 | 1 << 2,  // Loop, ShouldWrap
    Reverse: 1 << 5 | 1 << 2,      // ShouldWrap
};

/**
 * Specifies how time is treated when it is outside of the keyframe range of an Animation.
 * @readOnly
 * @enum WrapMode
 * @memberof cc
 */
var WrapMode = cc.Enum({

    /**
     * !#en Reads the default wrap mode set higher up.
     * !#zh 向 Animation Component 或者 AnimationClip 查找 wrapMode
     * @property {Number} Default
     */
    Default: 0,

    /**
     * !#en All iterations are played as specified.
     * !#zh 动画只播放一遍
     * @property {Number} Normal
     */
    Normal: 1,

    /**
     * !#en All iterations are played in the reverse direction from the way they are specified.
     * !#zh 从最后一帧或结束位置开始反向播放，到第一帧或开始位置停止
     * @property {Number} Reverse
     */
    Reverse: WrapModeMask.Reverse,

    /**
     * !#en When time reaches the end of the animation, time will continue at the beginning.
     * !#zh 循环播放
     * @property {Number} Loop
     */
    Loop: WrapModeMask.Loop,

    /**
     * !#en All iterations are played in the reverse direction from the way they are specified.
     * And when time reaches the start of the animation, time will continue at the ending.
     * !#zh 反向循环播放
     * @property {Number} LoopReverse
     */
    LoopReverse: WrapModeMask.Loop | WrapModeMask.Reverse,

    /**
     * !#en Even iterations are played as specified, odd iterations are played in the reverse direction from the way they
     * are specified.
     * !#zh 从第一帧播放到最后一帧，然后反向播放回第一帧，到第一帧后再正向播放，如此循环
     * @property {Number} PingPong
     */
    PingPong: WrapModeMask.PingPong,

    /**
     * !#en Even iterations are played in the reverse direction from the way they are specified, odd iterations are played
     * as specified.
     * !#zh 从最后一帧开始反向播放，其他同 PingPong
     * @property {Number} PingPongReverse
     */
    PingPongReverse: WrapModeMask.PingPong | WrapModeMask.Reverse
});

cc.WrapMode = WrapMode;


/**
 * The abstract interface for all playing animation.
 * @class AnimationNodeBase
 * @constructor
 * @extends Playable
 */
var AnimationNodeBase = function () {
    Playable.call(this);
};
JS.extend(AnimationNodeBase, Playable);

/**
 * @method update
 * @param deltaTime
 * @private
 */
AnimationNodeBase.prototype.update = function (deltaTime) {};


/**
 * The collection and instance of playing animations created by entity.animate.
 * @class AnimationNode
 * @extends AnimationNodeBase
 * @constructor
 * @param {Animator} animator
 * @param {AnimCurve[]} [curves]
 * @param {Object} [timingInput] - This dictionary is used as a convenience for specifying the timing properties of an Animation in bulk.
 */
function AnimationNode (animator, curves, timingInput) {
    AnimationNodeBase.call(this);

    this.animator = animator;

    /**
     * @property curves
     * @type {AnimCurve[]}
     */
    this.curves = curves || [];

    // http://www.w3.org/TR/web-animations/#idl-def-AnimationTiming

    /**
     * !#en The start delay which represents the number of seconds from an animation's start time to the start of
     * the active interval.
     * !#zh 延迟多少秒播放
     *
     * @property delay
     * @type {Number}
     * @default 0
     */
    this.delay = 0;

    /**
     * !#en The animation's iteration count property.
     *
     * A real number greater than or equal to zero (including positive infinity) representing the number of times
     * to repeat the animation node.
     *
     * Values less than zero and NaN values are treated as the value 1.0 for the purpose of timing model
     * calculations.
     *
     * !#zh 迭代次数, 指动画播放多少次后结束, normalize time. 如 2.5 ( 2次半 )
     *
     * @property repeatCount
     * @type {Number}
     * @default 1
     */
    this.repeatCount = 1;

    /**
     * !#en The iteration duration of this animation in seconds. (length)
     * !#zh 单次动画的持续时间, 秒
     *
     * @property duration
     * @type {Number}
     * @readOnly
     */
    this.duration = 1;

    /**
     * !#en The animation's playback speed. 1 is normal playback speed.
     * !#zh 播放速率
     * @property speed
     * @type {Number}
     * @default: 1.0
     */
    this.speed = 1;

    /**
     * !#en Wrapping mode of the playing animation.
     * !#zh 动画循环方式
     *
     * @property wrapMode
     * @type {WrapMode}
     * @default: WrapMode.Normal
     */
    this.wrapMode = WrapMode.Normal;

    if (timingInput) {
        this.delay = timingInput.delay || this.delay;

        var duration = timingInput.duration;
        if (typeof duration !== 'undefined') {
            this.duration = duration;
        }

        var speed = timingInput.speed;
        if (typeof speed !== 'undefined') {
            this.speed = speed;
        }

        //
        var wrapMode = timingInput.wrapMode;
        if (typeof wrapMode !== 'undefined') {
            var isEnum = typeof wrapMode === 'number';
            if (isEnum) {
                this.wrapMode = wrapMode;
            }
            else {
                this.wrapMode = WrapMode[wrapMode];
            }
        }

        var repeatCount = timingInput.repeatCount;
        if (typeof repeatCount !== 'undefined') {
            this.repeatCount = repeatCount;
        }
        else if (this.wrapMode & WrapModeMask.Loop) {
            this.repeatCount = Infinity;
        }
    }

    /**
     * The current time of this animation in seconds.
     * @property time
     * @type {Number}
     * @default 0
     */
    this.time = 0;

    this._timeNoScale = 0;
    this._firstFramePlayed = false;

    ///**
    // * The current iteration index beginning with zero for the first iteration.
    // * @property currentIterations
    // * @type {number}
    // * @default 0
    // * @readOnly
    // */
    //this.currentIterations = 0.0;

    // play

    if (this.delay > 0) {
        this.pause();
    }
    this.play();
}
JS.extend(AnimationNode, AnimationNodeBase);

JS.mixin(AnimationNode.prototype, {

    update: function (delta) {

        // calculate delay time

        if (this._isPaused) {
            this._timeNoScale += delta;
            if (this._timeNoScale < this.delay) {
                // still waiting
                return;
            }
            else {
                // play
                this.play();
            }
            //// start play
            // delta -= (this._timeNoScale - this.delay);
        }

        // make first frame perfect

        //var playPerfectFirstFrame = (this.time === 0);
        if (this._firstFramePlayed) {
            this.time += (delta * this.speed);
        }
        else {
            this._firstFramePlayed = true;
        }

        // sample

        if (this.sample()) {
            this.stop();
        }
    },

    _calculateWrappedTime: function (iterationTime, currentIterations) {
        var duration = this.duration;
        var wrapMode = this.wrapMode;
        if ((wrapMode & WrapModeMask.PingPong) === WrapModeMask.PingPong) {
            var isOddIteration = currentIterations & 1;
            if (isOddIteration) {
                iterationTime = duration - iterationTime;
            }
        }
        if ((wrapMode & WrapModeMask.Reverse) === WrapModeMask.Reverse) {
            iterationTime = duration - iterationTime;
        }
        return iterationTime;
    },

    sample: function () {

        // calculate times

        var stopped = false;
        var duration = this.duration;
        var ratio = 0;         // computed ratio
        var time = this.time;   // computed time
        var currentIterations = time / duration;
        if (currentIterations < this.repeatCount) {
            // calculate iteration time
            if (time > duration) {
                time %= duration;
            }
            // calculate wrapped time
            if (this.wrapMode & WrapModeMask.ShouldWrap) {
                time = this._calculateWrappedTime(time, currentIterations);
            }
            ratio = time / duration;
        }
        else {
            stopped = true;
            ratio = this.repeatCount - (this.repeatCount | 0);
            if (currentIterations > 0 && ratio === 0) {
                ratio = 1; // 如果播放过，动画不复位
            }
            time = ratio * duration;
        }

        // sample

        var curves = this.curves;
        var animator = this.animator;
        for (var i = 0, len = curves.length; i < len; i++) {
            var curve = curves[i];
            curve.sample(time, ratio, animator);
        }

        return stopped;
    }

    //onPlay: function () {
    //},
    //
    //onStop: function () {
    //}
});

cc.AnimationNode = AnimationNode;

module.exports = {
    WrapModeMask: WrapModeMask,
    WrapMode: WrapMode,
    AnimationNode: AnimationNode,
};