class GamePlayground {
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
}