/// <reference path="phaser/phaser.d.ts"/>
/// <reference path="joypad/GamePad.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var game = PIXI.game;
window.onload = function () {
    new ShooterGame();
};
var ShooterGame = (function (_super) {
    __extends(ShooterGame, _super);
    function ShooterGame() {
        _super.call(this, 1024, 700, Phaser.CANVAS, 'gameDiv');
        this.levelFinished = false;
        this.nextFire = 0;
        this.level = 1;
        this.TEXT_MARGIN = 50;
        this.PLAYER_ACCELERATION = 500;
        this.PLAYER_MAX_SPEED = 300;
        this.PLAYER_DRAG = 600;
        this.FIRE_RATE = 200;
        this.BULLET_SPEED = 800;
        this.state.add('main', mainState);
        this.state.start('main');
    }
    return ShooterGame;
})(Phaser.Game);
var mainState = (function (_super) {
    __extends(mainState, _super);
    function mainState() {
        _super.apply(this, arguments);
    }
    mainState.prototype.preload = function () {
        _super.prototype.preload.call(this);
        this.load.image('bg', 'assets/bg.png');
        this.load.image('player', 'assets/survivor1_machine.png');
        this.load.image('bullet', 'assets/bulletBeigeSilver_outline.png');
        this.load.image('zombie1', 'assets/zoimbie1_hold.png');
        this.load.image('zombie2', 'assets/zombie2_hold.png');
        this.load.image('robot', 'assets/robot1_hold.png');
        this.load.image('vida', 'assets/PickupRojo-low.png');
        this.load.image('explosion', 'assets/smokeWhite0.png');
        this.load.image('explosion2', 'assets/smokeWhite1.png');
        this.load.image('explosion3', 'assets/smokeWhite2.png');
        this.load.tilemap('tilemap', 'assets/tiles.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', 'assets/tilesheet_complete.png');
        this.load.image('joystick_base', 'assets/transparentDark05.png');
        this.load.image('joystick_segment', 'assets/transparentDark09.png');
        this.load.image('joystick_knob', 'assets/transparentDark49.png');
        this.physics.startSystem(Phaser.Physics.ARCADE);
        if (this.game.device.desktop) {
            this.game.cursors = this.input.keyboard.createCursorKeys();
        }
        else {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.forceOrientation(true);
            this.scale.startFullScreen(true);
        }
    };
    mainState.prototype.create = function () {
        _super.prototype.create.call(this);
        this.createTilemap();
        this.createWalls();
        this.createBackground();
        this.createVida();
        this.createPlayer();
        this.setupCamera();
        this.createExplosions();
        this.createBullets();
        this.createMonsters();
        this.createTexts();
        if (!this.game.device.desktop) {
        }
    };
    /*Creació de parets i fons.*/
    mainState.prototype.createTilemap = function () {
        this.game.tilemap = this.game.add.tilemap('tilemap');
        this.game.tilemap.addTilesetImage('tilesheet_complete', 'tiles');
    };
    mainState.prototype.createWalls = function () {
        this.game.walls = this.game.tilemap.createLayer('walls');
        this.game.walls.x = this.game.world.centerX;
        this.game.walls.y = this.game.world.centerY;
        this.game.walls.resizeWorld();
        this.game.tilemap.setCollisionBetween(1, 195, true, 'walls');
    };
    ;
    mainState.prototype.createBackground = function () {
        this.game.background = this.game.tilemap.createLayer('background');
        this.game.background.x = this.game.world.centerX;
        this.game.background.y = this.game.world.centerY;
    };
    ;
    /* Creació vida */
    mainState.prototype.createVida = function () {
        this.game.vida = this.add.sprite(this.rnd.between(65, 535), this.rnd.between(65, 535), 'vida');
        this.game.vida.anchor.setTo(0.5, 0.5);
        this.physics.enable(this.game.vida, Phaser.Physics.ARCADE);
    };
    /*Creació del jugador*/
    mainState.prototype.createPlayer = function () {
        var nouJugador = new Player(0, 3, this.game, this.world.centerX, this.world.centerY, 'player', 0);
        this.game.player = this.add.existing(nouJugador);
    };
    mainState.prototype.setupCamera = function () {
        this.camera.follow(this.game.player);
    };
    ;
    /*Moviment del jugador*/
    mainState.prototype.movePlayer = function () {
        var moveWithKeyboard = function () {
            if (this.game.cursors.left.isDown || this.input.keyboard.isDown(Phaser.Keyboard.A)) {
                this.game.player.body.acceleration.x = -this.game.PLAYER_ACCELERATION;
            }
            else if (this.game.cursors.right.isDown || this.input.keyboard.isDown(Phaser.Keyboard.D)) {
                this.game.player.body.acceleration.x = this.game.PLAYER_ACCELERATION;
            }
            else if (this.game.cursors.up.isDown || this.input.keyboard.isDown(Phaser.Keyboard.W)) {
                this.game.player.body.acceleration.y = -this.game.PLAYER_ACCELERATION;
            }
            else if (this.game.cursors.down.isDown || this.input.keyboard.isDown(Phaser.Keyboard.S)) {
                this.game.player.body.acceleration.y = this.game.PLAYER_ACCELERATION;
            }
            else {
                this.game.player.body.acceleration.x = 0;
                this.game.player.body.acceleration.y = 0;
            }
        };
        var moveWithVirtualJoystick = function () {
            if (this.game.gamepad.stick1.cursors.left) {
                this.game.player.body.acceleration.x = -this.game.PLAYER_ACCELERATION;
            }
            else if (this.game.gamepad.stick1.cursors.right) {
                this.game.player.body.acceleration.x = this.game.PLAYER_ACCELERATION;
            }
            else if (this.game.gamepad.stick1.cursors.up) {
                this.game.player.body.acceleration.y = -this.game.PLAYER_ACCELERATION;
            }
            else if (this.game.gamepad.stick1.cursors.down) {
                this.game.player.body.acceleration.y = this.game.PLAYER_ACCELERATION;
            }
            else {
                this.game.player.body.acceleration.x = 0;
                this.game.player.body.acceleration.y = 0;
            }
        };
        if (this.game.device.desktop) {
            moveWithKeyboard.call(this);
        }
        else {
            moveWithVirtualJoystick.call(this);
        }
    };
    ;
    mainState.prototype.rotatePlayerToPointer = function () {
        this.game.player.rotation = this.physics.arcade.angleToPointer(this.game.player, this.input.activePointer);
    };
    ;
    /* Shots*/
    mainState.prototype.fire = function () {
        if (this.time.now > this.game.nextFire) {
            var bullet = this.game.bullets.getFirstDead();
            if (bullet) {
                var length = this.game.player.width * 0.5 + 20;
                var x = this.game.player.x + (Math.cos(this.game.player.rotation) * length);
                var y = this.game.player.y + (Math.sin(this.game.player.rotation) * length);
                bullet.reset(x, y);
                this.explosion(x, y);
                bullet.angle = this.game.player.angle;
                var velocity = this.game.physics.arcade.velocityFromRotation(bullet.rotation, this.game.BULLET_SPEED);
                bullet.body.velocity.setTo(velocity.x, velocity.y);
                this.game.nextFire = this.time.now + this.game.FIRE_RATE;
            }
        }
    };
    ;
    mainState.prototype.fireWhenButtonClicked = function () {
        if (this.input.activePointer.isDown) {
            this.fire();
        }
    };
    ;
    /*Creació d'explosions*/
    mainState.prototype.createExplosions = function () {
        var _this = this;
        this.game.explosions = this.add.group();
        this.game.explosions.createMultiple(20, 'explosion');
        this.game.explosions.setAll('anchor.x', 0.5);
        this.game.explosions.setAll('anchor.y', 0.5);
        this.game.explosions.forEach(function (explosion) {
            explosion.loadTexture(_this.rnd.pick(['explosion', 'explosion2', 'explosion3']));
        }, this);
    };
    ;
    mainState.prototype.explosion = function (x, y) {
        var explosion = this.game.explosions.getFirstDead();
        if (explosion) {
            explosion.reset(x - this.rnd.integerInRange(0, 5) + this.rnd.integerInRange(0, 5), y - this.rnd.integerInRange(0, 5) + this.rnd.integerInRange(0, 5));
            explosion.alpha = 0.6;
            explosion.angle = this.rnd.angle();
            explosion.scale.setTo(this.rnd.realInRange(0.5, 0.75));
            this.add.tween(explosion.scale).to({ x: 0, y: 0 }, 500).start();
            var tween = this.add.tween(explosion).to({ alpha: 0 }, 500);
            tween.onComplete.add(function () {
                explosion.kill();
            });
            tween.start();
        }
    };
    ;
    /*Creació de bullets*/
    mainState.prototype.createBullets = function () {
        this.game.bullets = this.add.group();
        this.game.bullets.enableBody = true;
        this.game.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.game.bullets.createMultiple(20, 'bullet');
        this.game.bullets.setAll('anchor.x', 0.5);
        this.game.bullets.setAll('anchor.y', 0.5);
        this.game.bullets.setAll('scale.x', 0.5);
        this.game.bullets.setAll('scale.y', 0.5);
        this.game.bullets.setAll('outOfBoundsKill', true);
        this.game.bullets.setAll('checkWorldBounds', true);
    };
    ;
    /*Creació de monstres*/
    mainState.prototype.createMonsters = function () {
        this.game.monsters = this.add.group();
        var factory = new MonsterFactory(this.game);
        for (var i = 0; i < this.game.level; i++) {
            this.newMonster(factory.createMonster('robot'));
        }
        for (var i = 0; i < this.game.level; i++) {
            this.newMonster(factory.createMonster('zombie1'));
        }
        for (var i = 0; i < this.game.level; i++) {
            this.newMonster(factory.createMonster('zombie2'));
        }
    };
    ;
    mainState.prototype.newMonster = function (monster) {
        this.game.add.existing(monster);
        this.game.monsters.add(monster);
    };
    mainState.prototype.resetMonster = function (monster) {
        monster.rotation = this.physics.arcade.angleBetween(monster, this.game.player);
    };
    /* Creació de textos */
    mainState.prototype.createTexts = function () {
        var width = this.scale.bounds.width;
        var height = this.scale.bounds.height;
        this.game.scoreText = this.game.add.text(this.game.TEXT_MARGIN, this.game.TEXT_MARGIN, 'Score: ' + this.game.player.getScore(), {
            font: "30px Arial",
            fill: "#ffffff"
        });
        this.game.scoreText.fixedToCamera = true;
        this.game.livesText = this.game.add.text(width - this.game.TEXT_MARGIN, this.game.TEXT_MARGIN, 'Lives: ' + this.game.player.getLives(), {
            font: "30px Arial",
            fill: "#ffffff"
        });
        this.game.livesText.anchor.setTo(1, 0);
        this.game.livesText.fixedToCamera = true;
        this.game.maxLivesText = this.game.add.text(width - this.game.TEXT_MARGIN, this.game.TEXT_MARGIN + 20, 'Max Lives: ' + this.game.player.getMaxLives(), {
            font: "30px Arial",
            fill: "#ffffff"
        });
        this.game.maxLivesText.anchor.setTo(1, 0);
        this.game.maxLivesText.fixedToCamera = true;
        this.game.levelText = this.game.add.text(width / 2, this.game.TEXT_MARGIN, 'Level: ' + this.game.level, {
            font: "30px Arial",
            fill: "#ffffff"
        });
        this.game.levelText.anchor.setTo(1, 0);
        this.game.levelText.fixedToCamera = true;
        this.game.stateText = this.add.text(width / 2, height / 2, '', { font: '84px Arial', fill: '#fff' });
        this.game.stateText.anchor.setTo(0.5, 0.5);
        this.game.stateText.fixedToCamera = true;
    };
    /*Fisiques*/
    mainState.prototype.monsterTouchesPlayer = function (player, monster) {
        monster.kill();
        player.damage(1);
        this.game.player.lives -= 1;
        this.game.player.notify(); //observer
        console.log("en el monster:" + this.game.player.getScore(), this.game.player.getLives());
        this.blink(player);
        if (player.health == 0) {
            this.game.stateText.text = " GAME OVER \n Click to restart";
            this.game.stateText.visible = true;
            this.input.onTap.addOnce(this.restart, this);
        }
    };
    mainState.prototype.bulletHitWall = function (bullet, walls) {
        this.explosion(bullet.x, bullet.y);
        bullet.kill();
    };
    mainState.prototype.bulletHitMonster = function (bullet, monster) {
        bullet.kill();
        monster.damage(4);
        this.explosion(bullet.x, bullet.y);
        if (monster.health > 0) {
            this.blink(monster);
        }
        else {
            this.game.player.score += 10; //observer
            this.game.player.notify();
            console.log("en el bullet:" + this.game.player.getScore(), this.game.player.getLives());
            monster.kill();
        }
    };
    mainState.prototype.blink = function (sprite) {
        var tween = this.add.tween(sprite)
            .to({ alpha: 0.5 }, 100, Phaser.Easing.Bounce.Out)
            .to({ alpha: 1.0 }, 100, Phaser.Easing.Bounce.Out);
        tween.repeat(3);
        tween.start();
    };
    mainState.prototype.checkMonsters = function () {
        return this.game.monsters.countLiving();
    };
    mainState.prototype.checkNextLevel = function () {
        if (this.checkMonsters() == 0) {
            this.game.levelFinished = true;
        }
        if (this.checkMonsters() == 0 && this.game.levelFinished == true) {
            this.game.levelFinished = false;
            this.game.level = this.game.level + 1;
            this.game.levelText.setText('Level: ' + this.game.level);
            this.createMonsters();
        }
    };
    mainState.prototype.nextLevel = function () {
        if (this.game.levelFinished = true) {
            this.game.levelFinished = false;
            this.game.level = this.game.level + 1;
            this.game.levelText.setText('Level: ' + this.game.level);
            this.createMonsters();
        }
    };
    mainState.prototype.nuevaVida = function () {
        if (this.game.player.getLives() < this.game.player.getMaxLives()) {
            this.game.vida.kill();
            this.game.player.setLives();
            this.game.player.notify();
            var newX = this.rnd.between(65, 535);
            var newY = this.rnd.between(65, 800);
            this.game.vida.reset(newX, newY);
        }
        else {
        }
    };
    mainState.prototype.update = function () {
        _super.prototype.update.call(this);
        this.movePlayer();
        this.rotatePlayerToPointer();
        this.fireWhenButtonClicked();
        this.checkNextLevel();
        this.physics.arcade.collide(this.game.player, this.game.monsters, this.monsterTouchesPlayer, null, this);
        this.physics.arcade.collide(this.game.player, this.game.walls);
        this.physics.arcade.overlap(this.game.bullets, this.game.monsters, this.bulletHitMonster, null, this);
        this.physics.arcade.collide(this.game.bullets, this.game.walls, this.bulletHitWall, null, this);
        this.physics.arcade.collide(this.game.walls, this.game.monsters, this.resetMonster, null, this);
        this.physics.arcade.collide(this.game.monsters, this.game.monsters, this.resetMonster, null, this);
        this.physics.arcade.overlap(this.game.player, this.game.vida, this.nuevaVida, null, this);
    };
    ;
    mainState.prototype.restart = function () {
        this.game.vida.destroy();
        this.game.player.destroy();
        this.game.level = 1;
        this.game.levelText.setText("Level: " + this.game.level);
        this.game.state.restart();
    };
    return mainState;
})(Phaser.State);
//FACTORY: Creació de monstres
var Monster = (function (_super) {
    __extends(Monster, _super);
    function Monster(game, x, y, key, frame) {
        _super.call(this, game, x, y, key, frame);
        this.MONSTER_HEALTH = 10;
        this.MONSTER_SPEED = 100;
        this.game = game;
        this.anchor.set(0.5, 0.5);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.enableBody = true;
        this.angle = game.rnd.angle();
        this.checkWorldBounds = true;
        this.health = this.MONSTER_HEALTH;
        this.body.velocity.setTo(this.MONSTER_SPEED);
        this.checked = false;
    }
    Monster.prototype.update = function () {
        _super.prototype.update.call(this);
        this.events.onOutOfBounds.add(this.resetMonster, this);
        this.game.physics.arcade.velocityFromAngle(this.angle, this.MONSTER_SPEED, this.body.velocity);
    };
    Monster.prototype.resetMonster = function (monster) {
        monster.rotation = this.game.physics.arcade.angleBetween(monster, this.game.player);
    };
    return Monster;
})(Phaser.Sprite);
var MonsterFactory = (function () {
    function MonsterFactory(game) {
        this.game = game;
    }
    MonsterFactory.prototype.createMonster = function (key) {
        if (key == 'robot') {
            return new Robot(this.game, key);
        }
        if (key == 'zombie1') {
            return new Zombie1(this.game, key);
        }
        if (key == 'zombie2') {
            return new Zombie2(this.game, key);
        }
    };
    return MonsterFactory;
})();
var Robot = (function (_super) {
    __extends(Robot, _super);
    function Robot(game, key) {
        _super.call(this, game, 250, 250, key, 0);
        this.MONSTER_HEALTH = 10;
        this.health = this.MONSTER_HEALTH;
        this.MONSTER_SPEED = 100;
        this.body.velocity.setTo(this.MONSTER_SPEED);
    }
    Robot.prototype.update = function () {
        _super.prototype.update.call(this);
        this.enfadat();
    };
    Robot.prototype.enfadat = function () {
        if (this.health <= 5 && this.checked == false) {
            this.scale.multiply(2, 2);
            this.checked = true;
        }
    };
    return Robot;
})(Monster);
var Zombie1 = (function (_super) {
    __extends(Zombie1, _super);
    function Zombie1(game, key) {
        _super.call(this, game, 750, 750, key, 0);
        this.MONSTER_HEALTH = 15;
        this.health = this.MONSTER_HEALTH;
        this.MONSTER_SPEED = 150;
        this.body.velocity.setTo(this.MONSTER_SPEED);
    }
    Zombie1.prototype.update = function () {
        _super.prototype.update.call(this);
        this.enfadat();
    };
    Zombie1.prototype.enfadat = function () {
        if (this.health <= 6 && this.checked == false) {
            this.scale.multiply(1.5, 1.5);
            this.checked = true;
        }
    };
    return Zombie1;
})(Monster);
var Zombie2 = (function (_super) {
    __extends(Zombie2, _super);
    function Zombie2(game, key) {
        _super.call(this, game, 250, 750, key, 0);
        this.MONSTER_HEALTH = 20;
        this.health = this.MONSTER_HEALTH;
        this.MONSTER_SPEED = 200;
        this.body.velocity.setTo(this.MONSTER_SPEED);
    }
    Zombie2.prototype.update = function () {
        _super.prototype.update.call(this);
        this.enfadat();
    };
    Zombie2.prototype.enfadat = function () {
        if (this.health <= 7 && this.checked == false) {
            this.scale.multiply(2, 2);
            this.checked = true;
        }
    };
    return Zombie2;
})(Monster);
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(score, lives, game, x, y, key, frame) {
        _super.call(this, game, x, y, key, frame);
        this.max_lives = 3;
        this.game = game;
        this.anchor.setTo(0.5, 0.5);
        this.score = score;
        this.lives = lives;
        this.health = this.lives;
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.maxVelocity.setTo(this.game.PLAYER_MAX_SPEED, this.game.PLAYER_MAX_SPEED);
        this.body.collideWorldBounds = true;
        this.body.drag.setTo(this.game.PLAYER_DRAG, this.game.PLAYER_DRAG);
        this.displayStats = new DisplayStats(this);
    }
    Player.prototype.suscribe = function (displayStats) {
        this.displayStats = displayStats;
    };
    Player.prototype.notify = function () {
        this.displayStats.updateStats(this.getScore(), this.getLives(), this.getMaxLives());
    };
    Player.prototype.getScore = function () {
        return this.score;
    };
    Player.prototype.getLives = function () {
        return this.lives;
    };
    Player.prototype.getMaxLives = function () {
        return this.max_lives;
    };
    Player.prototype.setLives = function () {
        this.lives += 1;
        this.health = this.lives;
    };
    Player.prototype.setMaxLives = function () {
        this.max_lives += 1;
    };
    return Player;
})(Phaser.Sprite);
var DisplayStats = (function () {
    function DisplayStats(player) {
        this.pointsUpdate = 0;
        this.counter = 0;
        this.player = player;
        this.player.suscribe(this);
        this.game = this.player.game;
        this.lives = this.player.lives;
        this.points = this.player.score;
        this.max_lives = this.player.max_lives;
    }
    DisplayStats.prototype.displayData = function () {
        this.game.scoreText.setText('Score: ' + this.points);
        this.game.livesText.setText('Lives: ' + this.lives);
        this.game.maxLivesText.setText('MaxLives: ' + this.max_lives);
    };
    DisplayStats.prototype.updateStats = function (points, lives, max_lives) {
        this.points = points;
        this.lives = lives;
        this.max_lives = max_lives;
        this.pointsCheck = points;
        this.checkMaxLives(this.pointsCheck);
        this.displayData();
    };
    DisplayStats.prototype.checkMaxLives = function (pointsCheck) {
        pointsCheck = pointsCheck - this.pointsUpdate;
        if (pointsCheck >= 100) {
            this.counter += 1;
            this.player.setMaxLives();
            this.pointsUpdate = pointsCheck * this.counter;
            console.log("max vida:" + this.player.getMaxLives());
        }
    };
    return DisplayStats;
})();
//# sourceMappingURL=main.js.map