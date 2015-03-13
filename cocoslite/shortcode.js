String.prototype.endWith = function(endStr) {
    var d=this.length-endStr.length;
    return (d>=0 && this.lastIndexOf(endStr)==d);
};


cl.Point = function(x, y)
{
    if (x == undefined)
        this.x = this.y = 0;
    else if (y == undefined) {
        this.x = x.x; 
        this.y = x.y;
    } else if(x == undefined && y == undefined) {
        this.x = this.y = 0;
    } else {
        this.x = x;
        this.y = y;
    }
}

cl.Point.prototype.equal = function(p){
    return this.x == p.x && this.y == p.y;
}

cl.Point.prototype.add = function(p){
    var n = new cl.Point();
    n.x = this.x + p.x;
    n.y = this.y + p.y;
    return n;
}

cl.Point.prototype.addToSelf = function(p){
    this.x += p.x;
    this.y += p.y;
    return this;
}

cl.Point.prototype.sub = function(p){
    var n = new cl.Point();
    n.x = this.x - p.x;
    n.y = this.y - p.y;
    return n;
}

cl.Point.prototype.subToSelf = function(p){
    this.x -= p.x;
    this.y -= p.y;
    return this;
}

cl.Point.prototype.mult = function(v){
    var n = new cl.Point();
    n.x = this.x * v;
    n.y = this.y * v;
    return n;
}

cl.Point.prototype.multToSelf = function(v){
    this.x *= v;
    this.y *= v;
    return this;
}

cl.Point.prototype.divide = function(v){
    var n = new cl.Point();
    n.x = this.x / v;
    n.y = this.y / v;
    return n;
}

cl.Point.prototype.divideToSelf = function(v){
    this.x /= v;
    this.y /= v;
    return this;
}

cl.Point.prototype.normalize = function(){
    var t = cc.pNormalize(this);
    this.x = t.x;
    this.y = t.y;
}

cl.Point.prototype.cross = function(p){
    return this.x * p.y - this.y * p.x;
}

cl.Point.prototype.inTriangle = function(a, b, c){

    var ab = b.sub(a),
        ac = c.sub(a), 
        ap = this.sub(a);

    //用矢量积计算面积，下面4个值的绝对值，是对应的三角形的面积的两倍，

    var abc = ab.cross(ac);
    var abp = ab.cross(ap);
    var apc = ap.cross(ac);
    var pbc = abc - abp - apc;   //等于pb.cross(pc)

    //面积法：4个三角形的面积差 等于 0

    var delta = Math.abs(abc) - Math.abs(abp) - Math.abs(apc) - Math.abs(pbc);

    return Math.abs(delta) < 0.05;        
}

cl.Point.lerp = function(a, b, alpha){
    var t = cc.pLerp(a,b,alpha);
    return cl.p(t.x, t.y);
}

cl.Point.sqrMagnitude = function(a){
    return a.x * a.x + a.y * a.y;
}


cc.p = cl.p = function(x,y){
    return new cl.Point(x, y);
}



Math.lerp = function(a, b, alpha){
    return a + (b - a) * alpha;
}

Math.clamp = function(value, min, max)
{
    if (value < min){
        value = min;
    } else {
        if (value > max) {
            value = max;
        }
    }
    return value;
}

