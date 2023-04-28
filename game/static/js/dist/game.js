class GameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
            <div class="game-menu">
                <div class="game-menu-field">
                    <div class="game-menu-field-item game-menu-field-item-single-mode">
                        单人模式
                    </div>

                    <br>

                    <div class="game-menu-field-item game-menu-field-item-multi-mode">
                        多人模式(待开发)
                    </div>

                    <br>

                    <div class="game-menu-field-item game-menu-field-item-settings">
                        设置
                    </div>
                </div>
            </div>
        `);
        this.root.$game.append(this.$menu); //将menu加入到game的div内
        this.$single_mode = this.$menu.find('.game-menu-field-item-single-mode'); //取出对应的标签
        this.$multi_mode = this.$menu.find('.game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.game-menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function () {
            outer.hide();
            outer.root.playground.show();
        });

        this.$multi_mode.click(function () {
            console.log("click multi mode");
        });

        this.$settings.click(function () {
            console.log("click settings");
        });

    }

    show() {
        this.$menu.show();
    }

    hide() {
        this.$menu.hide();
    }

}let GAME_OBJECTS = [];
let Debug = true;

let skill = "";
let skill_list_long = {
    len: 3,
    s0: { name: "fireball", img: "./static/img/weapon/firestaff.png", cold: 2, total: 3, color: "orange", damage: 50 , length: 1 },
    s1: { name: "snowstaff", img: "./static/img/weapon/snowstaff.png", cold: 1, total: 2, color: "white", damage: 30, length: 0.8 },
    s2: { name: "poisonstaff", img: "./static/img/weapon/poisonstaff.png", cold: 1, total: 4, color: "green", damage: 60, length: 0.6 }
}

let skill_list_short = {
    len: 3,
    s0: { name: "goldsword", img: "./static/img/weapon/goldsword.png", cold: 1, total: 2, damage: 30 , length: 0.15, time: 1.5 },
    s1: { name: "knife", img: "./static/img/weapon/knife.png", cold: 1, total: 1, damage: 20, length: 0.1, time: 2 },
    s2: { name: "axe", img: "./static/img/weapon/axe.png", cold: 1, total: 4, damage: 50, length: 0.2, time: 1 }
}

let prop = { p1: 5, p2: 5, p3: 5, p4: 5 };

let change = function (num) {
    return num / 1000 * 1.5;
}

let rechange = function (num) {
    return num / 1.5 * 1000;
}

class GameObject {
    constructor() {
        GAME_OBJECTS.push(this);
        this.has_called_start = false;//是否执行过start函数
        this.timedelta = 0;//当前帧和上一帧两帧之间的时间间隔
        this.uid = GAME_OBJECTS.length;
    }

    start() {

    }

    update() {

    }

    on_destroy() {

    }

    destroy() {
        this.on_destroy();
        for (let i = 0; i < GAME_OBJECTS.length; i++) {
            if (GAME_OBJECTS[i] === this) {
                GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;

let GAME_ANIMATION = function (timestamp) {
    for (let i = 0; i < GAME_OBJECTS.length; i++) {
        let obj = GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        }
        else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    last_timestamp = timestamp;

    requestAnimationFrame(GAME_ANIMATION);
}

requestAnimationFrame(GAME_ANIMATION);class GameMap extends GameObject {
    constructor(playground, color) {
        super();//调用基类的构造函数
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
        this.color = color;
    }

    start() {
        this.$canvas.focus();
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        // this.ctx.fillStyle = "rgba(105,174,160,1)";
        this.ctx.fillStyle = `rgba(${this.color.R},${this.color.G},${this.color.B},1)`;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update() {
        this.render();
    }

    render() {
        // this.ctx.fillStyle = "rgba(105,174,160,0.2)";
        this.ctx.fillStyle = `rgba(${this.color.R},${this.color.G},${this.color.B},1)`;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);


    }

}class Monster extends GameObject {
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
                if (obj.long) {
                    obj.destroy();
                }
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
}class Object extends GameObject {
    constructor(playground, img_src, x, y, width, height, bw, bh, bx, by, fun) {
        super();
        this.playground = playground;
        this.img_src = img_src;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.ctx = this.playground.game_map.ctx;
        this.img = new Image();
        this.img.src = img_src;
        this.bw = bw;
        this.bh = bh;
        this.bx = bx;
        this.by = by;//碰撞盒子中心
        this.fun = fun;//物体属性
    }

    start() {

    }

    add_listening_events() {

    }

    update() {
        this.render();
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.drawImage(this.img, (this.x - this.width / 2) * scale, (this.y - this.height / 2) * scale, this.width * scale, this.height * scale);
        //碰撞盒子
        if (Debug) {
            this.ctx.beginPath();
            this.ctx.rect((this.bx - this.bw / 2) * scale, (this.by - this.bh / 2) * scale, this.bw * scale, this.bh * scale);
            this.ctx.stroke();
        }
    }

    on_destroy() {

    }
}

class Object_trends extends GameObject {
    constructor(playground, img_src, x, y, width, height, bw, bh, bx, by, fun, frame, rate) {
        super();
        this.playground = playground;
        this.img_src = img_src;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.ctx = this.playground.game_map.ctx;
        this.img = new Image();
        this.img.src = img_src;
        this.bw = bw;
        this.bh = bh;
        this.bx = bx;
        this.by = by;//碰撞盒子中心
        this.fun = fun;//物体属性
        this.flame = 0;
        this.img_x = 0;
        this.img_y = 0;
        this.frame = frame;//帧数
        this.rate = rate;//播放速率
        this.time_last = 0;//玩家存在时间用于渲染图片
    }

    start() {

    }

    add_listening_events() {

    }

    update() {
        this.render();
    }

    render() {
        let scale = this.playground.scale;
        this.time_last += this.timedelta / 1000;//存在时间
        this.flame = this.time_last * this.rate;//帧播放速率
        this.img_x = Math.floor(this.flame % this.frame);//播放帧的值

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect((this.x - this.width / 2) * scale, (this.y - this.height / 2) * scale, this.width * scale, this.height * scale);
        //this.ctx.strokeStyle = 'red';
        //this.ctx.stroke();
        //console.log(this.time_last);
        this.ctx.clip();
        this.ctx.drawImage(this.img, this.img_x * rechange(this.width), 0, rechange(this.width), rechange(this.height), (this.x - this.width / 2) * scale, (this.y - this.height / 2) * scale, this.width * scale, this.height * scale);
        this.ctx.restore();
        //碰撞盒子
        if (Debug) {
            this.ctx.beginPath();
            this.ctx.rect((this.bx - this.bw / 2) * scale, (this.by - this.bh / 2) * scale, this.bw * scale, this.bh * scale);
            this.ctx.stroke();
        }
    }

    on_destroy() {

    }
}class Player extends GameObject {
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
}class short_attack extends GameObject {
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
}class Ball extends GameObject {
    constructor(playground, x, y, radius, color, speed, vx, vy, move_length, damage) {
        super();
        this.playground = playground;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.vx = vx;
        this.vy = vy;
        this.move_length = move_length;
        this.damage = damage;
        this.ctx = this.playground.game_map.ctx;
        this.eps = 0.01;
        this.bh = this.bw = 1.414 * this.radius;
        this.long = true;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        this.update_move();
        this.collision();

        this.render();
    }

    update_move() {
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.bx = this.x;
        this.by = this.y;
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
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
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

        if (Debug) {
            this.ctx.beginPath();
            this.ctx.rect((this.bx - this.bw / 2) * scale, (this.by - this.bh / 2) * scale, this.bw * scale, this.bh * scale);
            this.ctx.stroke();
        }
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
}class GamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="game-playground"></div>`);
        this.map_id = 2;

        this.hide();
        this.root.$game.append(this.$playground);
        this.start();
        this.Objects = [];
        this.players = [];
        this.Monsters = [];
        this.weapon = [];
    }

    start() {
        let outer = this;
        $(window).on('resize', function () {
            outer.resize();
        });
    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
        if (this.game_map) {
            this.game_map.resize();
        }
    }

    change_map(id) {
        GAME_OBJECTS = [];
        this.Objects = [];
        this.players = [];
        this.Monsters = [];
        this.$playground.empty();
        if (id === 1) {
            this.game_map = new GameMap(this, { R: 105, G: 174, B: 160 });//105,174,160
            this.map_id = 1;
            this.create_map1();
        }
        else if (id === 0) {
            this.game_map = new GameMap(this, { R: 105, G: 174, B: 160 });//217,230,106
            this.map_id = 0;
            this.create_map0();
        }
        else if (id === 2) {
            this.game_map = new GameMap(this, { R: 105, G: 174, B: 160 });//217,230,106
            this.map_id = 2;
            this.create_map2();
        }
    }

    create_monster1(num) {
        for (let i = 0; i < num; i++){
            let random = Math.random();
            this.Monsters.push(new Monster(this, "./static/img/monster/monster1.png", this.width * random / this.scale, random, change(90), change(90),
                0.1, "monster1", change(90) * 0.3, change(90) * 0.2, 0, 0, 7, 7.5, 100));
        }
    }

    create_map0() {
        console.log("map0");
        //设置位置的时候使用比例，不要使用确定值
        this.Objects.push(new Object(this, "./static/img/house/House0.png", this.width * 3 / 4 / this.scale, 0.5,
            change(207), change(201), change(207) * 0.7, change(201) * 0.7, this.width * 3 / 4 / this.scale, 0.5, { fun: "structure", id: 1 }));
        
        this.Objects.push(new Object(this, "./static/img/house/House1.png", this.width / 2 / this.scale, 0.3,//红房子
            change(161), change(141), change(161) * 0.9, change(141) * 0.7, (this.width) / 2 / this.scale, 0.3, { fun: "structure", id: 1 }));
        this.Objects.push(new Object(this, "./static/img/blank.png", this.width / 2 / this.scale, 0.35,
            change(50), change(50), change(35), change(50), this.width * 14 / 30 / this.scale, 0.36, { fun: "door", id: 1 }));//House1的门
        
        this.Objects.push(new Object(this, "./static/img/blank.png", this.width * 3 / 4 / this.scale, 0.5,
            change(50), change(50), change(35), change(50), this.width * 3 / 4 / this.scale, 0.6, { fun: "door", id: 2 }));//House0的门

        this.Objects.push(new Object_trends(this, "./static/img/structure/fountain.png", this.width / 4 / this.scale, 0.5,
            change(96), change(100), change(96) * 0.8, change(100) * 0.6, this.width / 4 / this.scale, 0.5, { fun: "structure", id: 1 }, 10, 10));

        this.Objects.push(new Object(this, "./static/img/plant/Bush2.png", this.width / 3 / this.scale, 1 / 3,
            change(44), change(33), change(44), change(33), this.width / 3 / this.scale, 1 / 3, { fun: "transparent", id: 1 }));

        this.Objects.push(new Object(this, "./static/img/plant/Tree_Swing.png", this.width / 4 / this.scale, 3 / 4,
            change(109), change(128), change(109) * 0.7, change(128) * 0.4, this.width / 4 / this.scale, 47 / 64, { fun: "Tree", id: 1 }));

        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, change(33), change(37), 0.15, "me",
            change(33) * 0.7, change(37) * 0.9, 7, 7.5));//添加玩家自己
        //添加其他玩家
    }

    create_map1() {
        console.log("map1");
        //地图边界碰撞
        //上边界
        this.Objects.push(new Object(this, "./static/img/blank.png", this.width / 2 / this.scale, 0,
            change(50), change(50), change(1500), change(5), this.width / 2 / this.scale, 0, { fun: "border", id: 0 }));
        //左上角
        this.Objects.push(new Object(this, "./static/img/blank.png", 0, 0,
            change(50), change(50), change(10), change(10), 0, 0, { fun: "border", id: 0 }));
        //左边界
        this.Objects.push(new Object(this, "./static/img/blank.png", 0, 0.5,
            change(50), change(50), change(5), change(1500), 0, 0.5, { fun: "border", id: 0 }));
        //左下角
        this.Objects.push(new Object(this, "./static/img/blank.png", 0, 1,
            change(50), change(50), change(10), change(10), 0, 1, { fun: "border", id: 0 }));
        //下边界
        this.Objects.push(new Object(this, "./static/img/blank.png", this.width / 2 / this.scale, 1,
            change(50), change(50), change(1500), change(5), this.width / 2 / this.scale, 1, { fun: "border", id: 0 }));
        //右下角
        this.Objects.push(new Object(this, "./static/img/blank.png", this.width / this.scale, 1,
            change(50), change(50), change(10), change(10), this.width / this.scale, 1, { fun: "border", id: 0 }));
        //右边界
        this.Objects.push(new Object(this, "./static/img/blank.png", this.width / this.scale, 0.5,
            change(50), change(50), change(5), change(1500), this.width / this.scale, 0.5, { fun: "border", id: 0 }));
        //右上角
        this.Objects.push(new Object(this, "./static/img/blank.png", this.width / this.scale, 0,
            change(50), change(50), change(10), change(10), this.width / this.scale, 0, { fun: "border", id: 0 }));

        // this.Monsters.push(new Monster(this, "./static/img/monster1.png", this.width / 4 / this.scale, 0.5, change(90), change(90),
        //     0.1, "monster", change(90) * 0.3, change(90) * 0.2, 0, 0, 7, 7.5, 100));
        this.create_monster1(5);

        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, change(33), change(37), 0.2, "me",
            change(33) * 0.7, change(37) * 0.9, 7, 7.5));//添加玩家自己
        //添加其他玩家
    }

    create_map2() {
        console.log("map2");
        this.Floor = new Object(this, "./static/img/witch_house/Floor1.png", this.width / 2 / this.scale, 0.5,
            change(1200), change(675), change(1200), change(675), this.width / 2 / this.scale, 0.5, { fun: "transparent", id: 1 });//地板
        
        this.base = new Object(this, "./static/img/witch_house/base0.png", this.width * 0.24 / this.scale, 0.39,
            change(578), change(318), change(578), change(318), this.width * 0.24 / this.scale, 0.39, { fun: "transparent", id: 1 });//石阶
        
        this.wall = new Object(this, "./static/img/witch_house/Wall0.png", this.width / 2 / this.scale, 0.08,
            change(1200), change(100), change(1200), change(100), this.width / 2 / this.scale, 0.08, { fun: "transparent", id: 1 });//墙
        
        this.Carpet = new Object(this, "./static/img/witch_house/Carpet0.png", this.width / 2 / this.scale, 0.96,
            change(120), change(52), change(120), change(52), this.width / 2 / this.scale, 0.96, { fun: "transparent", id: 1 });//地毯
        
        this.Objects.push(new Object(this, "./static/img/witch_house/PotBase.png", this.width * 0.33 / this.scale, 0.35,
            change(115), change(115), change(115) * 0.7, change(115) * 0.6, this.width * 0.33 / this.scale, 0.35, { fun: "pot", id: 1 }));//锅底座
        
        this.pot = new Object(this, "./static/img/witch_house/Pot.png", this.width * 0.33 / this.scale, 0.34,
            change(102), change(85), change(102), change(85), this.width * 0.33 / this.scale, 0.34, { fun: "transparent", id: 1 });//锅
        
        this.potfire = new Object_trends(this, "./static/img/witch_house/PotFire.png", this.width * 0.333 / this.scale, 0.38,
            change(91.8), change(40), change(91.8), change(40), this.width * 0.333 / this.scale, 0.38, { fun: "transparent", id: 1 }, 23, 12);
        
        this.potfx = new Object_trends(this, "./static/img/witch_house/PotFx.png", this.width * 0.33 / this.scale, 0.317,
            change(61.5), change(39), change(61.5), change(39), this.width * 0.333 / this.scale, 0.35, { fun: "transparent", id: 1 }, 20, 5)
        
        this.Objects.push(new Object(this, "./static/img/blank.png", this.width / 2 / this.scale, 0.35,
            change(50), change(50), change(35), change(50), this.width * 0.5 / this.scale, 1, { fun: "door", id: 0 }));
        
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, change(33), change(37), 0.2, "me",
            change(33) * 0.7, change(37) * 0.9, 7, 7.5));//添加玩家自己
    }

    show() {
        this.$playground.show();
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this, { R: 105, G: 174, B: 160 });

        this.resize();
        //添加地图物品

        this.create_map2();
        //this.create_map1();
        // this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, change(33), change(37), 0.2, "me",
        //     change(33) * 0.7, change(37) * 0.9, 7, 7.5));//添加玩家自己
    }

    hide() {
        this.$playground.hide();
    }
}export class Game {
    constructor(id) {
        this.id = id;
        this.$game = $('#' + id);
        // this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);
        this.playground.show();
    }
}