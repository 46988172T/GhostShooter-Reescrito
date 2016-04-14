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
        super(800, 480, Phaser.CANVAS, 'gameDiv');
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
            this.scale.startFullScreen(false);
        }
    }

    create():void {
        super.create();

        this.createTilemap();
        this.createWalls();
        this.createBackground();

        this.createPlayer();
        this.setupCamera();


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
        var nouJugador = new Player(3, this.game, 100/*this.world.centerX, this.world.centerY*/,100, 'player', 0);
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

    rotatePlayerToPointer() {
        this.game.player.rotation = this.physics.arcade.angleToPointer(
            this.game.player,
            this.input.activePointer
        );
    };



    update():void{
        super.update();
        this.movePlayer();
        this.rotatePlayerToPointer();
    };
}








//Creem la classe PLAYER perque ens servirà per poder fer el OBSERVER.
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

/*
// FACTORY: Creació de monstres

class Monster extends Phaser.Sprite{

    constructor(game:ShooterGame, x:number, y:number, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture){

    }
    update():void{

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

    }
    update():void {
        super.update();
    }
    superAtac(){

    }
}

class Zombie1 extends Monster implements atacEspecial{
    constructor(game:ShooterGame, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture){

    }
    update():void {

    }
    superAtac(){

    }

}

class Zombie2 extends Monster implements atacEspecial{
    constructor(game:ShooterGame, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture){

    }
    update():void {
        super.update();
    }
    superAtac(){

    }
}

//STRATEGY: Els zombies fan coses diferents.

interface atacEspecial {

}*/
