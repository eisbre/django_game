class short_attack extends GameObject {
    constructor(playground, x, y, radius, damage, time) {
        super();
        this.playground = playground;
        this.bx = this.x = x;
        this.by = this.y = y;
        this.radius = radius;
        this.damage = damage;
        this.ctx = this.playground.game_map.ctx;
        this.eps = 0.01;
        this.bh = this.bw = 1.414 * this.radius;
        this.time = time;//近程技能效果
        this.long = false;
    }

    start() {
    }

    update() {
        if (this.time <= this.eps) {
            this.destroy();
            return false;
        }
        // this.collision();

        this.render();
        this.time -= this.timedelta / 1000;
        this.time = Math.max(this.time, 0);
        this.bx = this.playground.players[0].x;
        this.by = this.playground.players[0].y;
    }

    is_collision(x, y, width, height) {
        let w = Math.abs(this.x - x);
        let h = Math.abs(this.y - y);

        if (w < (this.bw + width) / 2 && h < (this.bh + height) / 2)
            return true;
        else
            return false;
    }

    collision() {
        for (let i = 0; i < this.playground.Objects.length; i++) {
            let obj = this.playground.Objects[i];
            if (this.is_collision(obj.bx, obj.by, obj.bw, obj.bh)) {
                console.log(obj.uid);
                if (obj.fun.fun !== "transparent") {
                    this.destroy();
                }
            }
        }
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.rect((this.bx - this.bw / 2) * scale, (this.by - this.bh / 2) * scale, this.bw * scale, this.bh * scale);
        this.ctx.lineWidth=1;
        this.ctx.stroke();

        // if (Debug) {
        //     this.ctx.beginPath();
        //     this.ctx.rect((this.bx - this.bw / 2) * scale, (this.by - this.bh / 2) * scale, this.bw * scale, this.bh * scale);
        //     this.ctx.stroke();
        // }
    }

    on_destroy() {
        let balls = this.playground.weapon;
        for (let i = 0; i < balls.length; i++) {
            if (balls[i] === this) {
                balls.splice(i, 1);
                break;
            }
        }
    }
}