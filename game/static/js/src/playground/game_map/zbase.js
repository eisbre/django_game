class GameMap extends GameObject {
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

}