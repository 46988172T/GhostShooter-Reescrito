/// <reference path="phaser/phaser.d.ts"/>
/// <reference path="joypad/GamePad.ts"/>

window.onload = () => {
    var game = new ShooterGame();
};
class ShooterGame extends Phaser.Game{
    player:Player;
    monsters:Phaser.Group;
    bullets:Phaser.Group;
    explosions:Phaser.Group;

    tilemap:Phaser.Tilemap;
    background:Phaser.TilemapLayer;

    scoreText:Phaser.Text;
    livesText:Phaser.Text;

    cursors:Phaser.CursorKeys;
    gamepad:Gamepads.GamePad;

    constructor() {
        super(800, 480, Phaser.CANVAS, 'gameDiv');
        this.state.add('main', mainState);
        this.state.start('main');
    }
}

class mainState extends Phaser.State{
    game:ShooterGame;

    preload(){
        super.preload();

    }

    create(){
        super.create();
    }

    update(){
        super.update()
    }
}

class Player extends Phaser.Sprite{

}

// FACTORY: Creació de monstres

class Monster extends Phaser.Sprite{

    game:ShooterGame;
    MONSTER_HEALTH = 0;
    MONSTER_SPEED:number;

    constructor(game:ShooterGame, x:number, y:number){
        super(game, x,y);
        this.game = game;
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.enableBody = true;
        this.anchor.setTo(0.5,0.5);
        this.angle = game.rnd.angle();
        this.checkWorldBounds = true;
    }
    update():void{
        super.update();
        this.events.onOutOfBounds.add(this.resetMonster, this);
        this.game.physics.arcade.velocityFromAngle(this.angle, this.MONSTER_SPEED, this.body.velocity);
    }

    resetMonster(monster:Phaser.Sprite) {
        monster.rotation = this.game.physics.arcade.angleBetween(
            monster,
            this.game.player
        );
    }
}

class MonsterFactory{

}

class Robot extends Monster implements atacEspecial{

}

class Zombie1 extends Monster implements atacEspecial{

}

class Zombie2 extends Monster implements atacEspecial{

}

//STRATEGY: Els zombies fan coses diferents.

interface atacEspecial {

}