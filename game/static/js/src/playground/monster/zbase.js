class Monster extends GameObject {
    constructor(playground, img, x, y, width, height, speed, role, bw, bh, img_x, img_y, frame, rate, HP) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;
        this.speed = speed;
        this.role = role;
        this.eps = 0.01;
        this.friction = 0.9;//摩擦力
        this.spent_time = 0;
        this.bw = bw;
        this.bh = bh;//碰撞盒子大小
        this.img_x = img_x;
        this.img_y = img_y;
        this.time_last = 0;//存在时间用于渲染图片
        this.flame = 0;
        this.frame = frame;
        this.rate = rate;
        this.state = 0;
        this.bx = this.x;
        this.by = this.y + 0.015;
        this.HP = HP;
        this.px = 0;
        this.py = 0;

        //渲染人物图像
        this.img = new Image();
        this.img.src = img;
    }

    start() {

    }

    is_attacked() {
        for (let i = 0; i < this.playground.weapon.length; i++) {//检查是否有与魔法球碰撞
            let obj = this.playground.weapon[i];
            if (this.is_collision(obj.bx, obj.by, obj.bw, obj.bh)) {
                console.log(obj.uid);
                let damage = obj.damage;
                this.HP -= damage;
                let angle = Math.atan2(this.y - obj.by, this.x - obj.bx);
                this.damage_x = Math.cos(angle);
                this.damage_y = Math.sin(angle);
                this.damage_speed = damage * 0.2;
                obj.destroy();
            }
        }
        console.log(this.HP);
        if (this.HP < this.eps) {
            this.destroy();
        }
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        if (this.damage_speed > this.eps) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    move(tx, ty) {
        let angle = Math.atan2(ty - this.y, tx - this.x) * 180 / Math.PI;

        if (angle <= 90 && angle > -90) {
            this.state = 1;
        }
        else {
            this.state = 0;
        }
        this.move_to(tx, ty);
    }

    is_collision(x, y, width, height) {
        let w = Math.abs(this.x - x);
        let h = Math.abs(this.y - y);

        if (w < (this.bw + width) / 2 && h < (this.bh + height) / 2)
            return true;
        else
            return false;
    }

    // collision() {
    //     for (let i = 0; i < this.playground.Objects.length; i++) {
    //         let obj = this.playground.Objects[i];
    //         if (this.is_collision(obj.bx, obj.by, obj.bw, obj.bh)) {
    //             console.log(obj.uid);
    //             if (obj.fun.fun !== "transparent") {
    //                 this.move_length = 0;
    //             }
    //         }
    //     }
    // }

    get_postion() {
        let player = this.playground.players[0];
        this.px = player.x;
        this.py = player.y;
    }

    update_move() {
        if (this.move_length < this.eps) {
            this.move_length = 0;
            this.vx = this.vy = 0;
            this.state = 0;
        }
        else {
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
        }
    }

    update() {
        this.update_move();
        this.render();
        // this.collision();
        this.get_postion();
        this.move(this.px, this.py);//控制去的位置
        this.is_attacked();
    }

    render() {
        let scale = this.playground.scale;
        this.time_last += this.timedelta / 1000;//存在时间
        this.flame = this.time_last * this.rate;//帧播放速率
        this.img_x = Math.floor(this.flame % this.frame);//播放帧的值

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect((this.x - this.width / 2) * scale, (this.y - this.height / 2) * scale, this.width * scale, this.height * scale);

        this.ctx.clip();
        // this.ctx.drawImage(this.img, rechange(this.width) * this.img_x, rechange(this.height) * this.state,
        //     rechange(this.width) - 2, rechange(this.height) - 2, (this.x - this.width / 2) * scale, (this.y - this.height / 2) * scale, this.width * scale, this.height * scale);

        this.ctx.drawImage(this.img, rechange(this.width) * this.img_x, rechange(this.height) * this.state,
            rechange(this.width) - 2, rechange(this.height) - 2, (this.x - this.width / 2) * scale, (this.y - this.height / 2) * scale, this.width * scale, this.height * scale);
        this.ctx.restore();

        this.bx = this.x;
        this.by = this.y;
        //碰撞盒子
        if (Debug) {
            this.ctx.beginPath();
            this.ctx.rect((this.bx - this.bw / 2) * scale, (this.by - this.bh / 2) * scale, this.bw * scale, this.bh * scale);
            this.ctx.stroke();
        }
    }

    on_destroy() {
        for (let i = 0; i < this.playground.Monsters.length; i++) {
            if (this.playground.Monsters[i] === this) {
                this.playground.Monsters.splice(i, 1);
            }
        }
    }
}