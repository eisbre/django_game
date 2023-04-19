class GamePlayground {
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
            this.map_id = 1;
            this.create_map1();
        }
        else if (id === 0) {
            this.game_map = new GameMap(this, { R: 105, G: 174, B: 160 });//217,230,106
            this.map_id = 0;
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

        // this.Monsters.push(new Monster(this, "./static/img/monster1.png", this.width / 4 / this.scale, 0.25, change(90), change(90),
        //     0.2, "monster", change(90) * 0.3, change(90) * 0.2, 0, 0, 7, 7.5, 100));

        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, change(33), change(37), 0.15, "me",
            change(33) * 0.7, change(37) * 0.9, 7, 7.5));//添加玩家自己
        //添加其他玩家
    }

    create_map1() {
        console.log("map1");
        this.Objects.push(new Object(this, "./static/img/blank.png", this.width / 3 / this.scale, 1,
            change(50), change(50), change(50), change(50), this.width / 3 / this.scale, 1, { fun: "door", id: 0 }));

        this.Monsters.push(new Monster(this, "./static/img/monster1.png", this.width / 4 / this.scale, 0.5, change(90), change(90),
            0.1, "monster", change(90) * 0.3, change(90) * 0.2, 0, 0, 7, 7.5, 100));

        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, change(33), change(37), 0.2, "me",
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
}