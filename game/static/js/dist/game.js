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
let Debug = false;
let HP = 100;
let skill = "";
let skill_list_long = {
    len: 2,
    s0: { name: "fireball", img: "./static/img/firestaff.png", cold: 2, total: 3, color: "orange", damage: 50 },
    s1: { name: "goldarrow", img: "./static/img/goldarrow.png", cold: 1, total: 2, color: "white", damage: 30 },
}

let skill_list_short = {
    len: 2,
    s0: { name: "goldsword", img: "./static/img/goldsword.png", cold: 1, total: 4 },
    s1: { name: "drill", img: "./static/img/drill.png", cold: 1, total: 4 },
}

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

    collision() {
        for (let i = 0; i < this.playground.Objects.length; i++) {
            let obj = this.playground.Objects[i];
            if (this.is_collision(obj.bx, obj.by, obj.bw, obj.bh)) {
                console.log(obj.uid);
                if (obj.fun.fun !== "transparent") {
                    this.move_length = 0;
                }
            }
        }
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
        this.collision();
        //console.log(this.width / 6 / this.playground.scale);
        this.move(0, 0);//控制去的位置
        this.is_attacked();
    }

    render() {
        //console.log(this.timedelta);
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
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
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
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        this.update_move();

        this.render();
        this.collision();
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
        this.map_id = 0;

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
            this.create_map1();
        }
        else if (id === 0) {
            this.game_map = new GameMap(this, { R: 105, G: 174, B: 160 });//217,230,106
            this.create_map0();
        }
    }

    create_map0() {
        console.log("map0");
        //设置位置的时候使用比例，不要使用确定值
        this.Objects.push(new Object(this, "./static/img/House0.png", this.width * 3 / 4 / this.scale, 0.5,
            change(207), change(201), change(207) * 0.7, change(201) * 0.7, this.width * 3 / 4 / this.scale, 0.5, { fun: "structure", id: 1 }));
        this.Objects.push(new Object(this, "./static/img/House1.png", this.width / 2 / this.scale, 0.3,
            change(161), change(141), change(161) * 0.9, change(141) * 0.7, (this.width) / 2 / this.scale, 0.3, { fun: "structure", id: 1 }));
        this.Objects.push(new Object(this, "./static/img/blank.png", this.width / 2 / this.scale, 1,
            change(50), change(50), change(50), change(50), this.width / 2 / this.scale, 1, { fun: "door", id: 1 }));

        this.Objects.push(new Object_trends(this, "./static/img/fountain.png", this.width / 4 / this.scale, 0.5,
            change(96), change(100), change(96) * 0.8, change(100) * 0.6, this.width / 4 / this.scale, 0.5, { fun: "structure", id: 1 }, 10, 10));

        this.Objects.push(new Object(this, "./static/img/Bush2.png", this.width / 3 / this.scale, 1 / 3,
            change(44), change(33), change(44), change(33), this.width / 3 / this.scale, 1 / 3, { fun: "transparent", id: 1 }));

        this.Objects.push(new Object(this, "./static/img/Tree_Swing.png", this.width / 4 / this.scale, 3 / 4,
            change(109), change(128), change(109) * 0.7, change(128) * 0.4, this.width / 4 / this.scale, 47 / 64, { fun: "Tree", id: 1 }));

        this.Monsters.push(new Monster(this, "./static/img/monster1.png", this.width / 4 / this.scale, 0.25, change(90), change(90),
            0.2, "monster", change(90) * 0.3, change(90) * 0.2, 0, 0, 7, 7.5, 100));

        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, change(33), change(37), 0.15, "me",
            change(33) * 0.7, change(37) * 0.9, 7, 7.5));//添加玩家自己
        //添加其他玩家
    }

    create_map1() {
        console.log("map1");
        this.Objects.push(new Object(this, "./static/img/blank.png", this.width / 3 / this.scale, 1,
            change(50), change(50), change(50), change(50), this.width / 3 / this.scale, 1, { fun: "door", id: 0 }));

        this.Monsters.push(new Monster(this, "./static/img/monster1.png", this.width / 4 / this.scale, 0.25, change(90), change(90),
            0.2, "monster", change(90) * 0.3, change(90) * 0.2, 0, 0, 7, 7.5, 100));

        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, change(33), change(37), 0.15, "me",
            change(33) * 0.7, change(37) * 0.9, 7, 7.5));//添加玩家自己
        //添加其他玩家
    }

    show() {
        this.$playground.show();
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this, { R: 105, G: 174, B: 160 });

        this.resize();
        //添加地图物品

        this.create_map0();
        //this.create_map1();
    }

    hide() {
        this.$playground.hide();
    }
}export class Game {
    constructor(id) {
        this.id = id;
        this.$game = $('#' + id);
        this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);
        // this.playground.show();
    }
}