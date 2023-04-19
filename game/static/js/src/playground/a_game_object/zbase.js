let GAME_OBJECTS = [];
let Debug = true;

let skill = "";
let skill_list_long = {
    len: 2,
    s0: { name: "fireball", img: "./static/img/firestaff.png", cold: 2, total: 3, color: "orange", damage: 50 },
    s1: { name: "goldarrow", img: "./static/img/goldarrow.png", cold: 1, total: 2, color: "white", damage: 30 },
}

let skill_list_short = {
    len: 2,
    s0: { name: "goldsword", img: "./static/img/goldsword.png", cold: 1, total: 4, damage: 50 },
    s1: { name: "drill", img: "./static/img/drill.png", cold: 1, total: 4, damage: 30 },
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

requestAnimationFrame(GAME_ANIMATION);