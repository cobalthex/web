Vec2 = function(X, Y) {
    this.x = X;
    this.y = isNaN(Y) ? X : Y;
};
Vec2.prototype = {
    toString: function() {
        return `{x: ${this.x}, y: ${this.y}}`;
    },

    Equals: function(Vec) {
        return (this.x == Vec.x) && (this.y == Vec.y);
    },
    Within: function(Vec, Epsilon) {
        Epsilon = isNaN(Epsilon) ? 0.1 : Epsilon;
        return (Math.abs(this.x - Vec.x) <= Epsilon && Math.abs(this.y - Vec.y) <= Epsilon);
    },
    Clone: function() {
        return new Vec2(this.x, this.y);
    },
    Length: function() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    },
    LengthSq: function() {
        return (this.x * this.x) + (this.y * this.y);
    },
    Negate: function() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    },
    Negated: function() {
        return new Vec2(-this.x, -this.y);
    },
    Add: function(Magnitude) {
        if (!isNaN(Magnitude))
            Magnitude = new Vec2(Magnitude);

        this.x += Magnitude.x;
        this.y += Magnitude.y;
        return this;
    },
    Subtract: function(Magnitude) {
        if (!isNaN(Magnitude))
            Magnitude = new Vec2(Magnitude);

        this.x -= Magnitude.x;
        this.y -= Magnitude.y;
        return this;
    },
    Multiply: function(Magnitude) {
        if (!isNaN(Magnitude))
            Magnitude = new Vec2(Magnitude);
        this.x *= Magnitude.x;
        this.y *= Magnitude.y;
        return this;
    },
    Divide: function(Magnitude) {
        if (!isNaN(Magnitude))
            Magnitude = new Vec2(Magnitude);

        this.x /= Magnitude.x;
        this.y /= Magnitude.y;
        return this;
    },
    Normalize: function() {
        return this.Divide(this.Length());
    },
    Normalized: function() {
        var l = this.Length();
        return new Vec2(this.x / l, this.y / l);
    },
    Dot: function(Vec) {
        return (this.x * Vec.x) + (this.y * Vec.y);
    },
    //Simulate cross product where Z components are zero
    //Returns calculated Z value (X and Y both become 0)
    Cross: function(Vec) {
        return (x * Vec.y) - (Y * Vec.x);
    },
    Reflect: function(Normal) {
        var dot2x = 2 * this.Dot(Normal);
        this.x -= Normal.x * dot2x;
        this.y -= Normal.y * dot2x;
    },
    Reflected: function(Normal) {
        var dot2x = 2 * this.Dot(Normal);
        return new Vec2(this.x - (Normal.x * dot2x), this.y - (Normal.y * dot2x));
    },
    ToAngle: function() {
        return Math.atan2(this.y, this.x);
    },
    Flip: function() {
        var z = this.x;
        this.x = -this.y;
        this.y = z;
    },
    Flipped: function() {
        return new Vec2(-this.y, this.x);
    }
};
Vec2.Zero = new Vec2(0, 0);
Vec2.One = new Vec2(1, 1);
Vec2.Up = new Vec2(0, -1);
Vec2.Down = new Vec2(0, 1);
Vec2.Left = new Vec2(-1, 0);
Vec2.Right = new Vec2(1, 0);

Vec2[Symbol.iterator] = function*() {
    yield this.x;
    yield this.y;
};
Vec2.Add = function(A, B) {
    if (!isNaN(B))
        B = new Vec2(B);
    return new Vec2(A.x + B.x, A.y + B.y);
};
Vec2.Subtract = function(A, B) {
    if (!isNaN(B))
        B = new Vec2(B);
    return new Vec2(A.x - B.x, A.y - B.y);
};
Vec2.Multiply = function(A, B) {
    if (!isNaN(B))
        B = new Vec2(B);
    return new Vec2(A.x * B.x, A.y * B.y);
};
Vec2.Divide = function(A, B) {
    if (!isNaN(B))
        B = new Vec2(B);
    return new Vec2(A.x / B.x, A.y / B.y);
};
Vec2.Dot = function(A, B) {
    return (A.x * B.x) + (A.y * B.y);
};
//Simulate cross product where Z components are zero
//Returns calculated Z value (X and Y both become 0)
Vec2.Cross = function(A, B) {
    return (A.x * B.y) - (A.y * B.x);
};
Vec2.Reflect = function(Vec, Normal) {
    var dot2x = 2 * Vec2.Dot(Vec, Normal);
    return new Vec2(Vec.x - (Normal.x * dot2x), Vec.y - (Normal.y * dot2x));
};
Vec2.Distance = function(A, B) {
    return Vec2.Subtract(B, A).Length();
};
Vec2.DistanceSq = function(A, B) {
    return Vec2.Subtract(B, A).LengthSq();
};
Vec2.Lerp = function(A, B, T) {
    return new Vec2(A.x + (T * (B.x - A.x)), A.y + (T * (B.y - A.y)));
};
Vec2.LerpPrecise = function(A, B, T) {
    return new Vec2((1 - T) * A.x + (T * B.x), (1 - T) * A.y + (T * B.y));
};
Vec2.FromAngle = function(Radians) {
    return new Vec2(Math.cos(Radians), Math.sin(Radians));
};
