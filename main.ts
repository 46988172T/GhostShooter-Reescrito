/// <reference path="phaser/phaser.d.ts"/>
/// <reference path="joypad/GamePad.ts"/>

import game = PIXI.game;
window.onload = () => {
   new ShooterGame();
};
class ShooterGame extends Phaser.Game{
    player:Player;
    monsters:Phaser.Group;
    bullets:Phaser.Group;
    explosions:Phaser.Group;

    tilemap:Phaser.Tilemap;
    background:Phaser.TilemapLayer;
    walls:Phaser.TilemapLayer;
    scoreText:Phaser.Text;
    livesText:Phaser.Text;

    cursors:Phaser.CursorKeys;
    gamepad:Gamepads.GamePad;

    nextFire = 0;


    PLAYER_ACCELERATION = 500;
    PLAYER_MAX_SPEED = 300;
    PLAYER_DRAG = 600;
    FIRE_RATE = 200;
    BULLET_SPEED = 800;

    constructor() {
        super(1000, 1000, Phaser.CANVAS, 'gameDiv');
        this.state.add('main', mainState);
        this.state.start('main');
    }
}


class mainState extends Phaser.State {
    game:ShooterGame;

    preload() {
        super.preload();
        this.load.image('bg', 'assets/bg.png');
        this.load.image('player', 'assets/survivor1_machine.png');
        this.load.image('bullet', 'assets/bulletBeigeSilver_outline.png');

        this.load.image('zombie1', 'assets/zoimbie1_hold.png');
        this.load.image('zombie2', 'assets/zombie2_hold.png');
        this.load.image('robot', 'assets/robot1_hold.png');

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
        } else {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.forceOrientation(true);
            this.scale.startFullScreen(true);
        }
    }

    create():void {
        super.create();

        this.createTilemap();
        this.createWalls();
        this.createBackground();

        this.createPlayer();
        this.setupCamera();
        this.createExplosions();
        this.createBullets();
        this.createMonsters();

        if (!this.game.device.desktop) {

        }
    }

    /*Creació de parets i fons.*/
    private createTilemap() {
        this.game.tilemap = this.game.add.tilemap('tilemap');
        this.game.tilemap.addTilesetImage('tilesheet_complete', 'tiles');
    }

    private createWalls() {
        this.game.walls = this.game.tilemap.createLayer('walls');
        this.game.walls.x = this.game.world.centerX;
        this.game.walls.y = this.game.world.centerY;
        this.game.walls.resizeWorld();
        this.game.tilemap.setCollisionBetween(1, 195, true, 'walls');
    };

    private createBackground() {
        this.game.background = this.game.tilemap.createLayer('background');
        this.game.background.x = this.game.world.centerX;
        this.game.background.y = this.game.world.centerY;
    };

    /*Creació del jugador*/
    private createPlayer() {
        var nouJugador = new Player(3, this.game, this.world.centerX, this.world.centerY, 'player', 0);
        this.game.player = this.add.existing(nouJugador);
    }

    private setupCamera() {
        this.camera.follow(this.game.player);
    };

    /*Moviment del jugador*/
    movePlayer(){
        var moveWithKeyboard = function (){
            if (this.game.cursors.left.isDown || this.input.keyboard.isDown(Phaser.Keyboard.A)) {
                this.game.player.body.acceleration.x = -this.game.PLAYER_ACCELERATION;
            }
            else if (this.game.cursors.right.isDown || this.input.keyboard.isDown(Phaser.Keyboard.D)){
                this.game.player.body.acceleration.x = this.game.PLAYER_ACCELERATION;
            }
            else if (this.game.cursors.up.isDown || this.input.keyboard.isDown(Phaser.Keyboard.W)){
                this.game.player.body.acceleration.y = -this.game.PLAYER_ACCELERATION;
            }
            else if (this.game.cursors.down.isDown || this.input.keyboard.isDown(Phaser.Keyboard.S)){
                this.game.player.body.acceleration.y = this.game.PLAYER_ACCELERATION;
            }
            else{
                this.game.player.body.acceleration.x = 0;
                this.game.player.body.acceleration.y = 0;
            }
        };

        var moveWithVirtualJoystick = function (){
            if (this.game.gamepad.stick1.cursors.left){
                this.game.player.body.acceleration.x = -this.game.PLAYER_ACCELERATION;}
            else if (this.game.gamepad.stick1.cursors.right){
                this.game.player.body.acceleration.x = this.game.PLAYER_ACCELERATION;}
            else if (this.game.gamepad.stick1.cursors.up){
                this.game.player.body.acceleration.y = -this.game.PLAYER_ACCELERATION;}
            else if (this.game.gamepad.stick1.cursors.down){
                this.game.player.body.acceleration.y = this.game.PLAYER_ACCELERATION;}
            else{
                this.game.player.body.acceleration.x = 0;
                this.game.player.body.acceleration.y = 0;
            }
        };

        if (this.game.device.desktop) {
            moveWithKeyboard.call(this);
        }else {
            moveWithVirtualJoystick.call(this);
        }
    };

    rotatePlayerToPointer() {  //nota: amb aquest mètode el jugador rota amb el moviment del ratolí
        this.game.player.rotation = this.physics.arcade.angleToPointer(
            this.game.player,
            this.input.activePointer
        );
    };

    /* Shots*/
    fire():void {
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

    fireWhenButtonClicked() {
        if (this.input.activePointer.isDown) {
            this.fire();
        }
    };

    /*Creació d'explosions*/
    private createExplosions() {
        this.game.explosions = this.add.group();
        this.game.explosions.createMultiple(20, 'explosion');

        this.game.explosions.setAll('anchor.x', 0.5);
        this.game.explosions.setAll('anchor.y', 0.5);

        this.game.explosions.forEach((explosion:Phaser.Sprite) => {
            explosion.loadTexture(this.rnd.pick(['explosion', 'explosion2', 'explosion3']));
        }, this);
    };

    explosion(x:number, y:number):void {
        var explosion:Phaser.Sprite = this.game.explosions.getFirstDead();
        if (explosion) {
            explosion.reset(
                x - this.rnd.integerInRange(0, 5) + this.rnd.integerInRange(0, 5),
                y - this.rnd.integerInRange(0, 5) + this.rnd.integerInRange(0, 5)
            );
            explosion.alpha = 0.6;
            explosion.angle = this.rnd.angle();
            explosion.scale.setTo(this.rnd.realInRange(0.5, 0.75));

            this.add.tween(explosion.scale).to({x: 0, y: 0}, 500).start();
            var tween = this.add.tween(explosion).to({alpha: 0}, 500);
            tween.onComplete.add(() => {
                explosion.kill();
            });
            tween.start();
        }
    };

    /*Creació de bullets*/
    private createBullets() {
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

    // Creació de monstres
    private createMonsters(){
        this.game.monsters = this.add.group();
        var factory = new MonsterFactory(this.game);
        for (var i=0; i<3; i++){
            this.newMonster(factory.createMonster('robot'));
        }
        for (var i=0; i<3; i++){
            this.newMonster(factory.createMonster('zombie1'));
        }
        for (var i=0; i<3; i++){
            this.newMonster(factory.createMonster('zombie2'));
        }
    };

    newMonster(monster:Monster) {
        this.game.add.existing(monster);
        this.game.monsters.add(monster);
    }

    resetMonster(monster:Monster) {
        monster.rotation = this.physics.arcade.angleBetween(monster, this.game.player);
    }


    /*Fisiques*/

    private monsterTouchesPlayer(player:Phaser.Sprite, monster:Phaser.Sprite) {
        monster.kill();

        player.damage(1);

        /*this.livesText.setText("Lives: " + this.player.health);*/

        this.blink(player);

        /*if (player.health == 0) {
            this.stateText.text = " GAME OVER \n Click to restart";
            this.stateText.visible = true;

            //the "click to restart" handler
            this.input.onTap.addOnce(this.restart, this);
        }*/
    }

    private bulletHitWall(bullet:Phaser.Sprite, walls:Phaser.TilemapLayer) {
        this.explosion(bullet.x, bullet.y);
        bullet.kill();
    }

    private bulletHitMonster(bullet:Phaser.Sprite, monster:Phaser.Sprite) {
        bullet.kill();
        monster.damage(4);


        this.explosion(bullet.x, bullet.y);

        if (monster.health > 0) {
            this.blink(monster)
        } else {
            /*this.score += 10;
            this.scoreText.setText("Score: " + this.score);*/
            monster.kill()
        }
    }

    blink(sprite:Phaser.Sprite) {
        var tween = this.add.tween(sprite)
            .to({alpha: 0.5}, 100, Phaser.Easing.Bounce.Out)
            .to({alpha: 1.0}, 100, Phaser.Easing.Bounce.Out);

        tween.repeat(3);
        tween.start();
    }



    update():void{
        super.update();
        this.movePlayer();
        this.rotatePlayerToPointer();
        this.fireWhenButtonClicked();



        this.physics.arcade.collide(this.game.player, this.game.monsters, this.monsterTouchesPlayer, null, this);
        this.physics.arcade.collide(this.game.player, this.game.walls);
        this.physics.arcade.overlap(this.game.bullets, this.game.monsters, this.bulletHitMonster, null, this);
        this.physics.arcade.collide(this.game.bullets, this.game.walls, this.bulletHitWall, null, this);
        this.physics.arcade.collide(this.game.walls, this.game.monsters, this.resetMonster, null, this);
        this.physics.arcade.collide(this.game.monsters, this.game.monsters, this.resetMonster, null, this);

    };
}








// OBSERVER: Notificació de puntuació al player.

class Player extends Phaser.Sprite{
    game:ShooterGame;
    score:number;
    max_lives = 3;

    constructor(lives:number, game:ShooterGame, x:number, y:number, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture, frame:string|number){
        super(game, x, y, key, frame);
        this.game = game;

        this.score = 0;
        this.anchor.setTo(0.5, 0.5);
        this.health = lives;
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.maxVelocity.setTo(this.game.PLAYER_MAX_SPEED, this.game.PLAYER_MAX_SPEED);
        this.body.collideWorldBounds = true;
        this.body.drag.setTo(this.game.PLAYER_DRAG, this.game.PLAYER_DRAG);
    }
}


//FACTORY: Creació de monstres

class Monster extends Phaser.Sprite{
    game:ShooterGame;
    MONSTER_HEALTH:number;
    MONSTER_SPEED:number;

    constructor(game:ShooterGame, x:number, y:number, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture,frame:string|number){
        super(game, x, y, key, frame);
        this.game = game;
        this.anchor.set(0.5,0.5);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.enableBody = true;
        this.angle = game.rnd.angle();
        this.checkWorldBounds = true;
        this.health = this.MONSTER_HEALTH;
        this.body.velocity.setTo(this.MONSTER_SPEED);
    }

    update(){
        super.update();
        this.events.onOutOfBounds.add(this.resetMonster, this);
        this.game.physics.arcade.velocityFromAngle(this.angle, this.MONSTER_SPEED, this.body.velocity);
    }

    resetMonster(monster:Phaser.Sprite) {
        monster.rotation = this.game.physics.arcade.angleBetween(monster, this.game.player);
    }
}

class MonsterFactory{
    game:ShooterGame;
    constructor(game:ShooterGame){
        this.game = game;
    }
    createMonster(key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture):Monster{
        if(key == 'robot'){
            return new Robot(this.game, key);
        }
        if(key == 'zombie1'){
            return new Zombie1(this.game, key);
        }
        if (key == 'zombie2'){
            return new Zombie2(this.game, key);
        }
    }
}

class Robot extends Monster implements atacEspecial{
    constructor(game:ShooterGame, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture){
        super(game, 250, 250, key,0);
        this.MONSTER_HEALTH = 10;
        this.MONSTER_SPEED = 100;
    }

    update() {
        super.update();
        this.superAtac();
    }

    superAtac(){
        if(this.MONSTER_HEALTH <= 3){
            this.MONSTER_SPEED = this.MONSTER_SPEED+20;
        }
    }
}

class Zombie1 extends Monster implements atacEspecial{
    constructor(game:ShooterGame, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture){
        super(game, 750, 750, key,0);
        this.MONSTER_HEALTH = 15;
        this.MONSTER_SPEED = 150;
    }

    update() {
        super.update();
        this.superAtac();
    }

    superAtac(){
        if(this.MONSTER_HEALTH <= 4){
            this.MONSTER_SPEED = this.MONSTER_SPEED+20;
        }
    }

}

class Zombie2 extends Monster implements atacEspecial{
    constructor(game:ShooterGame, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture){
        super(game, 180, 750, key,0);
        this.MONSTER_HEALTH = 20;
        this.MONSTER_SPEED = 200;
    }

    update() {
        super.update();
        this.superAtac();
    }

    superAtac(){
        if(this.MONSTER_HEALTH <= 5){
            this.MONSTER_SPEED = this.MONSTER_SPEED+20;
        }
    }
}

//STRATEGY: Els zombies fan coses diferents.

interface atacEspecial {
    superAtac();
}
