## API

### GameMap

创建canvas画布，后面的图形都在此画布中渲染。

### GamePlayground

创建地图，用于承载所有地图上出现的物体。

变量

```javascript
this.map_id = 0;//地图id用于区分各个地图，只有在1号地图才能使用攻击技能
this.Objects = [];//存放地图上的物体，包括静态和动态物体
this.players = [];//存放玩家
this.Monsters = [];//存放敌人
this.weapon = [];//存放技能释放的魔法球，伤害区域的碰撞盒子
```



函数

```javascript
change_map(id);
```

传入地图id，函数会先清空各个数组，然后重新创建对应id的地图。

```javascript
create_monster1(num);
```

传入创建的怪的数量num，然后在地图中随机生成怪1

```javascript
create_map0();
```

用于在change_map中调用，生成地图0中的物体。

```javascript
create_map1();
```

用于在change_map中调用，生成地图1中的物体。



### Player

玩家类，用于产生主角（联机功能中实现队友）。

```js
class Player extends GameObject {
    constructor(playground, x, y, width, height, speed, role, bw, bh, frame, rate);
}
```

参数列表

`playground`：`GamePlayground`类的实例，用于承载Player类和其他地图物品，此参数传入用于调用其函数及变量。

`x`：图片渲染的中心x坐标（需要填对于地图宽度的比例除以度量）

`y`：图片渲染的中心y坐标（需要填对于地图高度的比例除以度量）

`width`：图片渲染的宽（需调用change函数转化）

`height`：图片渲染的高（需调用change函数转化）

`speed`：移动速度

`role`：player身份，玩家自己为"me"

`bw`：碰撞盒子的宽（需调用change函数转化，再使用比例调整具体大小）

`bh`：碰撞盒子的高（需调用change函数转化，再使用比例调整具体大小）

`frame`：渲染动画图片的帧数

`rate`：播放速度

示例

在`GamePlayground`类的实例中创建

```javascript
this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, change(33), change(37), 0.2, "me",change(33) * 0.7, change(37) * 0.9, 7, 7.5));//添加玩家自己
```



### Monster

敌人（怪）的类。

```js
class Monster extends GameObject {
    constructor(playground, img, x, y, width, height, speed, role, bw, bh, img_x, img_y, frame, rate, HP)；
}
```

参数列表

`playground`：`GamePlayground`类的实例，用于承载Player类和其他地图物品，此参数传入用于调用其函数及变量。

`img`：渲染的图片地址。

`x`：图片渲染的中心x坐标（需要填对于地图宽度的比例除以度量）

`y`：图片渲染的中心y坐标（需要填对于地图高度的比例除以度量）

`width`：图片渲染的宽（需调用change函数转化）

`height`：图片渲染的高（需调用change函数转化）

`speed`：移动速度

`role`：怪物代号，例如monster1

`bw`：碰撞盒子的宽（需调用change函数转化，再使用比例调整具体大小）

`bh`：碰撞盒子的高（需调用change函数转化，再使用比例调整具体大小）

`img_x`：渲染的图片的横坐标，可用于从图片中选出某一区域（动态图片填0）

`img_y`：渲染的图片的纵坐标，可用于从图片中选出某一区域（动态图片填0）

`frame`：渲染动画图片的帧数

`rate`：播放速度

`HP`：怪物血量

示例

```javascript
this.Monsters.push(new Monster(this, "./static/img/monster1.png", this.width * random / this.scale, random, change(90), change(90), 0.1, "monster1", change(90) * 0.3, change(90) * 0.2, 0, 0, 7, 7.5, 100));
```



### Object

静态物体类

```javascript
class Object extends GameObject {
    constructor(playground, img_src, x, y, width, height, bw, bh, bx, by, fun);
}
```

参数列表

`playground`：`GamePlayground`类的实例，用于承载Player类和其他地图物品，此参数传入用于调用其函数及变量。

`img_src`：渲染的图片地址。

`x`：图片渲染的中心x坐标（需要填对于地图宽度的比例除以度量）

`y`：图片渲染的中心y坐标（需要填对于地图高度的比例除以度量）

`width`：图片渲染的宽（需调用change函数转化）

`height`：图片渲染的高（需调用change函数转化）

`bw`：碰撞盒子的宽（需调用change函数转化，再使用比例调整具体大小）

`bh`：碰撞盒子的高（需调用change函数转化，再使用比例调整具体大小）

`b_x`：碰撞盒子的中心x坐标

`b_y`：碰撞盒子的中心y坐标

`fun`：使用一个对象存放物体类型和id，类型用于判断碰撞处理，id是附加信息

示例

```javascript
this.Objects.push(new Object(this, "./static/img/House0.png", this.width * 3 / 4 / this.scale, 0.5,change(207), change(201), change(207) * 0.7, change(201) * 0.7, this.width * 3 / 4 / this.scale, 0.5, { fun: "structure", id: 1 }));
```



### Object_trends

动态物体类

```javascript
class Object_trends extends GameObject {
    constructor(playground, img_src, x, y, width, height, bw, bh, bx, by, fun, frame, rate);
}
```

相比静态物体增加了帧数和播放速率。

示例

```javascript
this.Objects.push(new Object_trends(this, "./static/img/fountain.png", this.width / 4 / this.scale, 0.5, change(96), change(100), change(96) * 0.8, change(100) * 0.6, this.width / 4 / this.scale, 0.5, { fun: "structure", id: 1 }, 10, 10));
```

