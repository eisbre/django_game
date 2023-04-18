class Player extends GameObject {
    constructor(playground, x, y, width, height, speed, role, bw, bh, frame, rate) {
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
        this.skill_long_num = 1;
        this.skill_short_num = 0;
        this.spent_time = 0;
        this.time_last = 0;//玩家存在时间用于渲染图片
        this.img_x = 0;
        this.img_y = 0;
        this.flame = 0;
        this.mx = 0;
        this.my = 0;//鼠标位置
        this.state = 0;//角色状态
        this.bw = bw;
        this.bh = bh;//碰撞盒子大小
        this.frame = frame;//帧数
        this.rate = rate;
        if (this.role === "me") {
            //渲染人物图像
            this.img = new Image();
            this.img.src = './static/img/Eilie.png';
        }

        this.img_long = new Image();
        this.img_long.src = skill_list_long[`s${this.skill_long_num}`].img;

        this.img_short = new Image();
        this.img_short.src = skill_list_short[`s${this.skill_short_num}`].img;
    }

    start() {
        if (this.role === "me") {
            this.add_listening_events();
        }
        else {
            //其他玩家操作
        }
    }

    drawPointLine(x, y, dx, dy) {
        let angle = Math.atan2(dy - this.y, dx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let len = 0.04 * this.playground.scale;
        let px = x + len * vx;
        let py = y + len * vy;
        this.ctx.beginPath();
        this.ctx.arc(px, py, 2, 0, Math.PI * 2, false);
        // this.ctx.fillStyle = "rgba(0, 0, 255, 1)";
        this.ctx.fillStyle = skill_list_long[`s${this.skill_long_num}`].color;
        this.ctx.fill();
    }

    add_listening_events() {//键盘监听
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });

        this.playground.game_map.$canvas.mousemove(function (e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            let x = (e.clientX - rect.left) / outer.playground.scale;
            let y = (e.clientY - rect.top) / outer.playground.scale;
            //console.log(x, y);
            outer.mx = x;
            outer.my = y;
        });

        this.playground.game_map.$canvas.mousedown(function (e) {
            //console.log(e.which);
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                let angle = Math.atan2(ty - outer.y, tx - outer.x) * 180 / Math.PI;
                if (angle <= -135 || angle > 135) {
                    outer.state = 0;
                }
                else if (angle > -45 && angle <= 45) {
                    outer.state = 1;
                }
                else if (angle > -135 && angle <= -45) {
                    outer.state = 3
                }
                else if (angle <= 135 && angle > 45) {
                    outer.state = 2;
                }
                outer.move_to(tx, ty);
            }
            else if (e.which === 1) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
            }
        });

        this.playground.game_map.$canvas.keydown(function (e) {
            console.log(e.which);
            //远程技能
            if (e.which === 87) {//触发技能
                if (skill_list_long[`s${outer.skill_long_num}`].cold > outer.eps) {
                    return false;
                }
                outer.shoot_long();
            }
            if (e.which === 81) {
                outer.skill_long_num += 1;
            }
            else if (e.which === 69) {
                outer.skill_long_num -= 1;
                outer.skill_long_num = Math.abs(outer.skill_long_num);
            }
            outer.skill_long_num %= skill_list_long["len"];
            outer.img_long.src = skill_list_long[`s${outer.skill_long_num}`].img;

            //近程技能
            if (e.which === 83) {//触发技能
                if (skill_list_short[`s${outer.skill_short_num}`].cold > outer.eps) {
                    return false;
                }
                outer.shoot_short();
            }
            if (e.which === 65) {
                outer.skill_short_num += 1;
            }
            else if (e.which === 68) {
                outer.skill_short_num -= 1;
                outer.skill_short_num = Math.abs(outer.skill_short_num);
            }
            outer.skill_short_num %= skill_list_short["len"];
            outer.img_short.src = skill_list_short[`s${outer.skill_short_num}`].img;
        });
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    shoot_long() {
        skill_list_long[`s${this.skill_long_num}`].cold = skill_list_long[`s${this.skill_long_num}`].total;
        console.log("shoot");
        let x = this.x;
        let y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(this.my - this.y, this.mx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = skill_list_long[`s${this.skill_long_num}`].color;
        let speed = 0.5;
        let move_length = 1;
        let damage = skill_list_long[`s${this.skill_long_num}`].damage;
        let ball = new Ball(this.playground, x, y, radius, color, speed, vx, vy, move_length, damage);
        this.playground.weapon.push(ball);
    }

    shoot_short() {
        skill_list_short[`s${this.skill_short_num}`].cold = skill_list_short[`s${this.skill_short_num}`].total;
        console.log("shoot");
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
        for (let i = 0; i < this.playground.Objects.length; i++) {//检查是否有与物品碰撞
            let obj = this.playground.Objects[i];
            if (this.is_collision(obj.bx, obj.by, obj.bw, obj.bh)) {
                console.log(obj.uid);
                if (obj.fun.fun !== "transparent") {
                    this.move_length = 0;
                    if (obj.fun.fun === "door") {
                        this.playground.change_map(obj.fun.id);
                    }
                    else {
                        let angle = Math.atan2(this.y - obj.by, this.x - obj.bx);
                        this.damage_x = Math.cos(angle);
                        this.damage_y = Math.sin(angle);
                        this.damage_speed = 0.2;
                    }
                }
            }
        }
    }

    is_attacked() {
        for (let i = 0; i < this.playground.Monsters.length; i++) {//检查是否有与怪碰撞
            let mon = this.playground.Monsters[i];
            // console.log(obj);
            if (this.is_collision(mon.bx, mon.by, mon.bw, mon.bh)) {
                console.log(mon.uid);
                let damage = 5;
                HP -= damage;
                let angle = Math.atan2(this.y - mon.by, this.x - mon.bx);
                this.damage_x = Math.cos(angle);
                this.damage_y = Math.sin(angle);
                this.damage_speed = damage * 0.2;
                // this.damage_speed = 0.1;
            }
        }
    }

    update_move() {
        if (this.damage_speed > this.eps) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }
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

    update_coldtime() {
        skill_list_long[`s${this.skill_long_num}`].cold -= this.timedelta / 1000;
        skill_list_long[`s${this.skill_long_num}`].cold = Math.max(skill_list_long[`s${this.skill_long_num}`].cold, 0);

        skill_list_short[`s${this.skill_short_num}`].cold -= this.timedelta / 1000;
        skill_list_short[`s${this.skill_short_num}`].cold = Math.max(skill_list_short[`s${this.skill_short_num}`].cold, 0);
    }

    update() {
        this.update_move();
        this.render();
        this.collision();
        this.is_attacked();
        this.render_UI();
        this.update_coldtime();
    }

    render() {
        //console.log(this.timedelta);
        let scale = this.playground.scale;
        if (this.role === "me") {
            this.time_last += this.timedelta / 1000;//存在时间
            this.flame = this.time_last * this.rate;//帧播放速率
            this.img_x = Math.floor(this.flame % this.frame);//播放帧的值

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.rect((this.x - this.width / 2) * scale, (this.y - this.height / 2) * scale, this.width * scale, this.height * scale);

            this.ctx.clip();
            this.ctx.drawImage(this.img, rechange(this.width) * this.img_x, rechange(this.height) * this.state,
                rechange(this.width) - 2, rechange(this.height) - 2, (this.x - this.width / 2) * scale, (this.y - this.height / 2) * scale, this.width * scale, this.height * scale);
            this.ctx.restore();
            this.drawPointLine(this.x * scale, this.y * scale, this.mx, this.my);

            //碰撞盒子
            if (Debug) {
                this.ctx.beginPath();
                this.ctx.rect((this.x - this.bw / 2) * scale, (this.y - this.bh / 2) * scale, this.bw * scale, this.bh * scale);
                this.ctx.stroke();
            }
        }
    }

    render_UI() {
        //血量条
        let x = 0, y = 0.97, w = 0.2, h = 0.01;
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.fillStyle = "rgba(117, 116, 116, 1)";
        this.ctx.lineWidth = 2;
        this.ctx.rect(x * scale, y * scale, w * scale, h * scale);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.fillStyle = "rgba(48,142,104, 1)";
        this.ctx.rect(x * scale, y * scale, w * (HP / 100) * scale, h * scale);
        this.ctx.fill();

        //技能UI
        //远程技能
        let r = 0.03;
        x = 1.6, y = 0.95;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.img_long, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (skill_list_long[`s${this.skill_long_num}`].cold > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2,
                Math.PI * 2 * (1 - skill_list_long[`s${this.skill_long_num}`].cold / skill_list_long[`s${this.skill_long_num}`].total) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(132, 115, 112, 0.4)";
            this.ctx.fill();
        }
        //近程技能
        x = 1.7, y = 0.95;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.img_short, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (skill_list_short[`s${this.skill_short_num}`].cold > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2,
                Math.PI * 2 * (1 - skill_list_short[`s${this.skill_short_num}`].cold / skill_list_short[`s${this.skill_short_num}`].total) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(132, 115, 112, 0.4)";
            this.ctx.fill();
        }
    }

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
    }
}