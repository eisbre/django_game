class Object extends GameObject {
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
}