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
        this.HP = 100;
        this.Magic = 100;
        this.Strength = 100;
        this.Skill_long_flag = true;
        this.Skill_short_flag = true;
        this.protect_time = 5;
        this.action;
        if (this.role === "me") {
            //渲染人物图像
            this.img = new Image();
            this.img.src = './static/img/character/Eilie.png';
        }

        this.prop1_img = new Image();
        this.prop1_img.src = './static/img/prop/prop1.png';

        this.prop2_img = new Image();
        this.prop2_img.src = './static/img/prop/prop2.png';

        this.prop3_img = new Image();
        this.prop3_img.src = './static/img/prop/prop3.png';

        this.prop4_img = new Image();
        this.prop4_img.src = './static/img/prop/prop4.png';

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
        this.ctx.fillStyle = skill_list_long[`s${this.skill_long_num}`].color;
        this.ctx.fill();

        //绘制近战攻击区域
        let scale = this.playground.scale;
        let length = skill_list_short[`s${this.skill_short_num}`].length;
        let bh = 1.414 * length;
        let bw = 1.414 * length;
        this.ctx.beginPath();
        this.ctx.setLineDash([4]);//设定实线与空白的大小
        this.ctx.rect((this.x - bw / 2) * scale, (this.y - bh / 2) * scale, bw * scale, bh * scale);
        this.ctx.lineWidth = 0.5;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
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
            if (e.which === 1) {
                if (outer.playground.map_id === 1) {
                    if (skill_list_long[`s${outer.skill_long_num}`].cold > outer.eps) {
                        return false;
                    }
                    if (outer.Skill_long_flag) {
                        outer.shoot_long();
                        outer.Magic -= skill_list_long[`s${outer.skill_long_num}`].damage * 0.7;
                    }
                }
            }
        });

        // this.playground.game_map.$canvas.keyup(function (e) {
        //     if (e.which === 70) {
                
        //     }
        // });

        this.playground.game_map.$canvas.keydown(function (e) {
            if (e.which === 70) {//按F交互
                if (typeof (outer.action) === "undefined") {
                    return false;
                }
                else {
                    if (outer.action.fun.fun === "door") {
                        outer.playground.change_map(outer.action.fun.id);
                        outer.action = undefined;
                    }
                    else if (outer.action.fun.fun === "pot") {
                        outer.pot();
                        outer.action = undefined;
                    }
                }
            }
            console.log(e.which);
            if (outer.playground.map_id === 1) {
                //远程技能
                // if (e.which === 87) {//触发技能
                //     if (skill_list_long[`s${outer.skill_long_num}`].cold > outer.eps) {
                //         return false;
                //     }
                //     if (outer.Skill_long_flag) {
                //         outer.shoot_long();
                //         outer.Magic -= skill_list_long[`s${outer.skill_long_num}`].damage * 0.7;
                //     }
                // }
                if (e.which === 81) {
                    outer.skill_long_num += 1;
                }
                // else if (e.which === 69) {
                //     outer.skill_long_num -= 1;
                //     outer.skill_long_num = Math.abs(outer.skill_long_num);
                // }
                outer.skill_long_num %= skill_list_long["len"];
                outer.img_long.src = skill_list_long[`s${outer.skill_long_num}`].img;

                //近程技能
                if (e.which === 87) {//触发技能
                    if (skill_list_short[`s${outer.skill_short_num}`].cold > outer.eps) {
                        return false;
                    }
                    if (outer.Skill_short_flag) {
                        outer.shoot_short();
                        outer.Strength -= skill_list_short[`s${outer.skill_short_num}`].damage * 0.7;
                        outer.move_length = 0;
                    }
                }
                if (e.which === 69) {
                    outer.skill_short_num += 1;
                }
                // else if (e.which === 68) {
                //     outer.skill_short_num -= 1;
                //     outer.skill_short_num = Math.abs(outer.skill_short_num);
                // }
                outer.skill_short_num %= skill_list_short["len"];
                outer.img_short.src = skill_list_short[`s${outer.skill_short_num}`].img;
                //使用道具
                if (e.which === 49) {
                    if (prop["p1"] > 0) {
                        outer.HP = Math.min(100, outer.HP + 10);
                        prop["p1"] -= 1;
                    }
                }

                if (e.which === 50) {
                    if (prop["p2"] > 0) {
                        outer.Magic = Math.min(100, outer.Magic + 10);
                        prop["p2"] -= 1;
                    }
                }

                if (e.which === 51) {
                    if (prop["p3"] > 0) {
                        outer.Strength = Math.min(100, outer.Strength + 10);
                        prop["p3"] -= 1;
                    }
                }

                if (e.which === 52) {
                    if (prop["p4"] > 0) {
                        prop["p4"] -= 1;
                    }
                }
            }
        });
    }

    pot() {//使用pot
        console.log("pot");
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
        let x = this.x;
        let y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(this.my - this.y, this.mx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = skill_list_long[`s${this.skill_long_num}`].color;
        let speed = 0.5;
        let move_length = skill_list_long[`s${this.skill_long_num}`].length;
        let damage = skill_list_long[`s${this.skill_long_num}`].damage;
        let ball = new Ball(this.playground, x, y, radius, color, speed, vx, vy, move_length, damage);
        this.playground.weapon.push(ball);
    }

    shoot_short() {
        skill_list_short[`s${this.skill_short_num}`].cold = skill_list_short[`s${this.skill_short_num}`].total;
        this.now = this.total;
        let x = this.x;
        let y = this.y;
        let radius = skill_list_short[`s${this.skill_short_num}`].length;
        let damage = skill_list_short[`s${this.skill_short_num}`].damage;
        let time = skill_list_short[`s${this.skill_short_num}`].time;
        let attack = new short_attack(this.playground, x, y, radius, damage, time);
        this.playground.weapon.push(attack);
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
                        // this.playground.change_map(obj.fun.id);
                        this.action = obj;
                        let scale = this.playground.scale;
                        this.ctx.beginPath();
                        this.ctx.fillStyle = "black";
                        this.ctx.font = "20px serif";
                        this.ctx.fillText("按F进入", (this.x + 0.02) * scale, (this.y) * scale);
                    }
                    else if (obj.fun.fun === "pot") {
                        // this.playground.change_map(obj.fun.id);
                        this.action = obj;
                        let scale = this.playground.scale;
                        this.ctx.beginPath();
                        this.ctx.fillStyle = "black";
                        this.ctx.font = "20px serif";
                        this.ctx.fillText("按F使用", (this.x + 0.02) * scale, (this.y) * scale);
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
                if (this.protect_time < this.eps) {
                    this.HP -= damage;
                }
                let angle = Math.atan2(this.y - mon.by, this.x - mon.bx);
                this.damage_x = Math.cos(angle);
                this.damage_y = Math.sin(angle);
                this.damage_speed = damage * 0.2;
                if (this.HP <= 0) {
                    this.playground.change_map(0);
                    this.HP = 10;
                }
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

        if (this.protect_time > this.eps) {
            this.protect_time -= this.timedelta / 1000;
        }
    }

    update() {
        this.update_move();
        this.render();
        this.collision();
        this.is_attacked();
        if (this.playground.map_id === 1) {
            this.render_UI();
        }
        
        this.update_coldtime();
        // this.render_short();
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
            if (this.playground.map_id === 1) {
                this.drawPointLine(this.x * scale, this.y * scale, this.mx, this.my);   
            }

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
        let x = 0, y = 0.93, w = 0.2, h = 0.01;
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.fillStyle = "rgba(117, 116, 116, 1)";
        this.ctx.lineWidth = 2;
        this.ctx.rect(x * scale, y * scale, w * scale, h * scale);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = "rgba(48,142,104, 1)";
        this.ctx.beginPath();
        if (this.HP <= 80) {
            this.ctx.fillStyle = "rgba(18, 188, 56, 1)";
        }
        if (this.HP <= 30) {
            this.ctx.fillStyle = "rgba(255, 51, 51, 1)";
        }
        
        this.ctx.rect(x * scale, y * scale, w * (this.HP / 100) * scale, h * scale);
        this.ctx.fill();

        //魔法条
        x = 0, y = 0.95, w = 0.2, h = 0.01;
        this.ctx.beginPath();
        this.ctx.fillStyle = "rgba(117, 116, 116, 1)";
        this.ctx.lineWidth = 2;
        this.ctx.rect(x * scale, y * scale, w * scale, h * scale);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.fillStyle = "rgba(75, 118, 207, 1)";
        this.ctx.rect(x * scale, y * scale, w * (this.Magic / 100) * scale, h * scale);
        this.ctx.fill();

        //体力条
        x = 0, y = 0.97, w = 0.2, h = 0.01;
        this.ctx.beginPath();
        this.ctx.fillStyle = "rgba(117, 116, 116, 1)";
        this.ctx.lineWidth = 2;
        this.ctx.rect(x * scale, y * scale, w * scale, h * scale);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.fillStyle = "rgba(234, 152, 83, 1)";
        this.ctx.rect(x * scale, y * scale, w * (this.Strength / 100) * scale, h * scale);
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

        if (this.Magic >= skill_list_long[`s${this.skill_long_num}`].damage * 0.7) {
            this.Skill_long_flag = true;
            if (skill_list_long[`s${this.skill_long_num}`].cold > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(x * scale, y * scale);
                this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2,
                    Math.PI * 2 * (1 - skill_list_long[`s${this.skill_long_num}`].cold / skill_list_long[`s${this.skill_long_num}`].total) - Math.PI / 2, true);
                this.ctx.lineTo(x * scale, y * scale);
                this.ctx.fillStyle = "rgba(132, 115, 112, 0.4)";
                this.ctx.fill();
            }
        }
        else {
            this.Skill_long_flag = false;
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(255, 51, 51, 0.4)";
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

        if (this.Strength >= skill_list_short[`s${this.skill_short_num}`].damage * 0.7) {
            this.Skill_short_flag = true;
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
        else {
            this.Skill_short_flag = false;
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2 , true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(255, 51, 51, 0.4)";
            this.ctx.fill();
        }

        //道具
        //1加血
        x = 1.2, y = 0.95;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.prop1_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();
        this.ctx.fillStyle = "rgba(20, 24, 32, 1)";
        this.ctx.fillText("1", (x - 0.005) * scale, (y - 0.035) * scale);
        this.ctx.fillText(prop["p1"].toString(), (x + 0.015) * scale, (y + 0.044) * scale);
        //2加蓝
        x = 1.3, y = 0.95;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.prop2_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();
        this.ctx.fillText("2", (x - 0.005) * scale, (y - 0.035) * scale);
        this.ctx.fillText(prop["p2"].toString(), (x + 0.015) * scale, (y + 0.044) * scale);
        //3加红
        x = 1.4, y = 0.95;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.prop3_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();
        this.ctx.fillText("3", (x - 0.005) * scale, (y - 0.035) * scale);
        this.ctx.fillText(prop["p3"].toString(), (x + 0.015) * scale, (y + 0.044) * scale);
        //4炸弹
        x = 1.5, y = 0.95;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.prop4_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();
        this.ctx.fillText("4", (x - 0.005) * scale, (y - 0.035) * scale);
        this.ctx.fillText(prop["p4"].toString(), (x + 0.015) * scale, (y + 0.044) * scale);
    }

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
    }
}