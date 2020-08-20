function Actor(Name, Pos, Dir) {
    this.name = Name;
    this.pos = Pos;
    this.dir = Dir.Normalized();
};
Actor.prototype = {
    fov: Math.PI * 0.666,

    IsFacing: function(Point) {
        var dot = this.dir.Dot(Vec2.Subtract(Point, this.pos).Normalize());
        return (dot > (1 - (this.fov / Math.PI)));
    },
    IsBehind: function(Actor) {
        var dot = Vec2.Dot(Vec2.Subtract(Actor.pos, this.pos).Normalize(), Actor.dir);
        //console.log(dot, 0 - (Actor.fov / Math.PI));
        return (dot > (Actor.fov / Math.PI) - 1);
    },

    Draw: function(Context, Color) {
        Context.strokeStyle = Color;
        Context.beginPath();
        Context.arc(this.pos.x, this.pos.y, 20, 0, 2 * Math.PI);
        Context.stroke();

        var angle = this.dir.ToAngle();
        var fov = this.fov / 2;
        Context.beginPath();
        Context.setLineDash([5, 5]);
        //Context.moveTo(this.pos.x, this.pos.y);
        Context.arc(this.pos.x, this.pos.y, 40, angle - fov, angle + fov);
        //Context.closePath();
        Context.stroke();
        Context.setLineDash([]);

        Context.beginPath();
        Context.moveTo(this.pos.x, this.pos.y);
        var v = Vec2.Add(this.pos, Vec2.Multiply(this.dir, 30));
        Context.lineTo(v.x, v.y);
        Context.stroke();

        Context.font = "100 12px 'Source Sans Pro'";
        Context.strokeText(this.name, this.pos.x - 22, this.pos.y - 22);
    },
};

function Bullet(Pos, Dir, Speed, TargetActor) {
    this.pos = Pos;
    this.dir = Dir;
    this.speed = Speed;
    this.target = TargetActor;
    this.turnRate = 0.25 * Math.PI;
}
Bullet.prototype = {
    Draw: function(Context) {
        if (this.target) {
            var diff = Vec2.Subtract(this.target.pos, this.pos).Normalize();
            this.dir = Vec2.Lerp(this.dir, diff, 0.05); //todo: should work based off of max angle

            //stop tracking if overshot
            var dot = this.dir.Dot(Vec2.Subtract(this.target.pos, this.pos).Normalize());
            if (dot < 0)
                this.target = null;
        }

        Context.strokeStyle = '#f8c';
        Context.beginPath();
        var tail = Vec2.Subtract(this.pos, Vec2.Multiply(this.dir, this.speed * 2));
        Context.arrow(tail, this.dir, this.speed * 3);
        Context.stroke();
    }
};

a = new Actor('a', new Vec2(300, 300), Vec2.Right);
b = new Actor('b', new Vec2(450, 300), Vec2.Down);
bullets = [];

var cvs = document.getElementById('c');
var info = document.getElementById('info');
var debug = document.getElementById('debug');

var cxt = cvs.getContext('2d');
var keys = new Array(255);
var mouse = {
    pos: new Vec2(0),
    pressed: false
};

cxt.arrow = function(tail, direction, length) {
    this.moveTo(tail.x, tail.y);
    var d = direction.Normalized();
    var nose = Vec2.Add(tail, Vec2.Multiply(d, length));
    this.lineTo(nose.x, nose.y);

    var wc = Math.sqrt(3) / 2;
    var ws = 1 / 2;
    var wing = new Vec2(wc * d.x - ws * d.y, ws * d.x + wc * d.y);
    wing.Multiply(length / 2);
    this.lineTo(nose.x, nose.y);
    var lw = Vec2.Subtract(nose, wing);
    wing = new Vec2(wc * d.x + ws * d.y, -ws * d.x + wc * d.y);
    wing.Multiply(length / 2);
    var rw = Vec2.Subtract(nose, wing);
    this.moveTo(lw.x, lw.y);
    this.lineTo(nose.x, nose.y);
    this.lineTo(rw.x, rw.y);
}
cxt.x = function(center, radius) {
    this.moveTo(center.x - radius, center.y - radius);
    this.lineTo(center.x + radius, center.y + radius);
    this.moveTo(center.x - radius, center.y + radius);
    this.lineTo(center.x + radius, center.y - radius);
}

var lastShot = 0;
(function Loop(Time) {
    var speed = 5;
    if (keys[65])
        a.pos.x -= speed;
    if (keys[87])
        a.pos.y -= speed;
    if (keys[68])
        a.pos.x += speed;
    if (keys[83])
        a.pos.y += speed;
    if (mouse.pressed && lastShot + 60 < Time) {
        var target = null;
        var diff = Vec2.Subtract(b.pos, a.pos).Normalize();
        if (Vec2.Dot(diff, a.dir) > 0.75)
            target = b;
        bullets.push(new Bullet(a.pos.Clone(), a.dir.Clone(), 5, target));
        lastShot = Time;
    }

    a.dir = Vec2.Subtract(mouse.pos, a.pos).Normalize();

    cxt.clearRect(0, 0, cvs.width, cvs.height);
    cxt.strokeStyle = '#aaa';
    cxt.strokeRect(0, 0, cvs.width, cvs.height);

    var splats = [];

    for (var i in bullets)
    {
        var bullet = bullets[i];
        bullet.pos.Add(Vec2.Multiply(bullet.dir, bullet.speed));
        if ((bullet.target && bullet.pos.Within(bullet.target.pos, 10)) ||
            bullet.pos.x < -bullet.speed || bullet.pos.x > cvs.width + bullet.speed ||
            bullet.pos.y < -bullet.speed || bullet.pos.y > cvs.height + bullet.speed)
        {
            bullets.splice(i, 1);
            splats.push(bullet.pos);
        }
        else
            bullet.Draw(cxt);
    }

    var orbit = true;
    if (orbit)
    {
        cxt.beginPath();
        cxt.strokeStyle = 'red';
        for (var i in splats)
            cxt.x(splats[i], 4);
        cxt.stroke();

        var orbitRadius = 100;

        cxt.beginPath();
        cxt.strokeStyle = '#aaa';
        cxt.setLineDash([2, 7]);
        cxt.arc(a.pos.x, a.pos.y, orbitRadius, 0, 2 * Math.PI);
        cxt.stroke();
        cxt.setLineDash([]);

        var diff = Vec2.Subtract(b.pos, a.pos);
        var dl = diff.Length();
        var rpos = Vec2.Add(a.pos, Vec2.Multiply(diff.Normalized(), orbitRadius));
        var tangent = diff.Flipped();

        cxt.beginPath();
        cxt.strokeStyle = '#2d0';
        cxt.arrow(rpos, diff.Negated(), 15);
        cxt.stroke();
        cxt.beginPath();
        cxt.strokeStyle = '#d20';
        cxt.arrow(rpos, tangent, 15);
        cxt.stroke();

        cxt.strokeStyle = '#aaa';
        cxt.font = "100 12px 'Source Sans Pro'";
        cxt.strokeText('r', rpos.x + 5, rpos.y + 5);

        if (dl > orbitRadius)
        {
            var angleToTangent = Math.asin(orbitRadius / dl);
            var relAngle = diff.Negated().ToAngle();
            var det = -Vec2.Cross(b.dir, diff);

            var desiredAngle = relAngle - (angleToTangent * Math.sign(det));
            var desiredDir = Vec2.FromAngle(desiredAngle);

            // console.log(angleToTangent, relAngle);
            b.dir = desiredDir;
        }
        b.pos.Add(Vec2.Multiply(b.dir, 1 /* speed */));
    }

    a.Draw(cxt, '#0af');
    b.Draw(cxt, '#fa0');

    var detAToAB = Vec2.Cross(a.dir, Vec2.Subtract(b.pos, a.pos));

    info.innerHTML = `A Facing B: ${a.IsFacing(b.pos)}<br>A Behind B:${a.IsBehind(b)}<br>`
    + `A direction around B: ${detAToAB > 0 ? "cw" : "ccw"}`;

    requestAnimationFrame(Loop);
})(0);

cvs.addEventListener('mousemove', function(ev) {
    mouse.pos.x = ev.offsetX;
    mouse.pos.y = ev.offsetY;
});
cvs.addEventListener('mousedown', function(ev) {
    mouse.pressed = true;
});
cvs.addEventListener('mouseup', function(ev) {
    mouse.pressed = false;
});

window.addEventListener('keydown', function(ev) {
    keys[ev.which] = true;
});

window.addEventListener('keyup', function(ev) {
    keys[ev.which] = false;
});