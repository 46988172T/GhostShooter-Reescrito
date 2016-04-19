/// <reference path="phaser/phaser.d.ts"/>
/// <reference path="joypad/GamePad.ts"/>


/*
 *  GitHub: https://github.com/46988172T/GhostShooter-Reescrito
 */


import game = PIXI.game;
window.onload = () => {
   new ShooterGame();
};
class ShooterGame extends Phaser.Game{
	
	// Declarem les variables i les constants fora del mainState per poder fer els patrons.
    player:Player;
    monsters:Phaser.Group;
    bullets:Phaser.Group;
    explosions:Phaser.Group;
    vida:Phaser.Sprite;

    tilemap:Phaser.Tilemap;
    background:Phaser.TilemapLayer;
    walls:Phaser.TilemapLayer;

    scoreText:Phaser.Text;
    livesText:Phaser.Text;
    maxLivesText:Phaser.Text;
    stateText:Phaser.Text;
    levelText:Phaser.Text;
    levelFinished:boolean = false;

    cursors:Phaser.CursorKeys;
    gamepad:Gamepads.GamePad;

    nextFire = 0;
    level = 1;
    TEXT_MARGIN = 50;
    PLAYER_ACCELERATION = 500;
    PLAYER_MAX_SPEED = 300;
    PLAYER_DRAG = 600;
    FIRE_RATE = 200;
    BULLET_SPEED = 800;

    constructor() {
        super(1024, 700, Phaser.CANVAS, 'gameDiv');
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

	
	// Per organitzar millor el codi hem decidit fer un unic create(), cridant a les funcions que creen els elements del joc.
    create():void {
        super.create();

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

	
    /* Creació de sprite de recuperació de vida */
    createVida() {
        this.game.vida = this.add.sprite(this.rnd.between(65, 535), this.rnd.between(65, 535), 'vida');
        this.game.vida.anchor.setTo(0.5, 0.5);
        this.physics.enable(this.game.vida, Phaser.Physics.ARCADE);
    }

	
    /*Creació del jugador*/
    private createPlayer() {
        var nouJugador = new Player(0, 3, this.game, this.world.centerX, this.world.centerY, 'player', 0);
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


    /*Creació de monstres*/
    private createMonsters(){
        this.game.monsters = this.add.group();
        var factory = new MonsterFactory(this.game);
		
		// El número de monstres creats depen del nivell en el qual s'estigui: 1 monstre de cada per al nivell 1, 2 de cada per al 2, etc...
        for (var i=0; i<this.game.level; i++){
            this.newMonster(factory.createMonster('robot'));
        }
        for (var i=0; i<this.game.level; i++){
            this.newMonster(factory.createMonster('zombie1'));
        }
        for (var i=0; i<this.game.level; i++){
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


    /* Creació de textos */
    private createTexts() {
        var width = this.scale.bounds.width;
        var height = this.scale.bounds.height;

		//Text que indica la puntuació del player
        this.game.scoreText = this.game.add.text(this.game.TEXT_MARGIN, this.game.TEXT_MARGIN, 'Score: ' + this.game.player.getScore(), {
            font: "30px Arial",
            fill: "#ffffff"
        });
        this.game.scoreText.fixedToCamera = true;
		
		//Text que indica vides actuals del player.
        this.game.livesText = this.game.add.text(width - this.game.TEXT_MARGIN, this.game.TEXT_MARGIN, 'Lives: ' + this.game.player.getLives(), {
            font: "30px Arial",
            fill: "#ffffff"
        });
        this.game.livesText.anchor.setTo(1, 0);
        this.game.livesText.fixedToCamera = true;

		//Text que indica el màxim de vides possibles
        this.game.maxLivesText = this.game.add.text(width - this.game.TEXT_MARGIN, this.game.TEXT_MARGIN+20, 'Max Lives: ' + this.game.player.getMaxLives(), {
            font: "30px Arial",
            fill: "#ffffff"
        });
        this.game.maxLivesText.anchor.setTo(1, 0);
        this.game.maxLivesText.fixedToCamera = true;

		//Text que indica nivell
        this.game.levelText = this.game.add.text(width/2 , this.game.TEXT_MARGIN, 'Level: ' + this.game.level, {
            font: "30px Arial",
            fill: "#ffffff"
        });
        this.game.levelText.anchor.setTo(1, 0);
        this.game.levelText.fixedToCamera = true;
		
		//Text que indica el Game Over.
        this.game.stateText = this.add.text(width / 2, height / 2, '', {font: '84px Arial', fill: '#fff'});
        this.game.stateText.anchor.setTo(0.5, 0.5);
        this.game.stateText.fixedToCamera = true;
    }


    /*Fisiques*/
    private monsterTouchesPlayer(player:Phaser.Sprite, monster:Phaser.Sprite) {
        monster.kill();

        player.damage(1);

		//Aqui restem 1 de vida quan un monstre toca al player, i seguidament fa el notify() --> OBSERVER.
        this.game.player.lives -=1;
        this.game.player.notify(); 
       
        this.blink(player);

        if (player.health == 0) {
            this.game.stateText.text = " GAME OVER \n Click to restart";
            this.game.stateText.visible = true;
            this.input.onTap.addOnce(this.restart, this);
        }
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
			//Aqui sumem 10 de puntuacio quan una bala toca al monstre i el deixa en zero o negatiu de vida, 
			//i seguidament fa el notify() --> OBSERVER.
            this.game.player.score +=10; 
            this.game.player.notify();
            
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

	/*
	 *	Aquestes tres funcions son pel canvi de nivell, l'update verifica amb checkNextLevel(): si checkMonsters() retorna zero, que
	 *	vol dir que no hi ha monstres a la pantalla, checkNextLevel() indica amb un boolea en true que s'ha finalitzat el nivell. 
	 *	Immediatament verifica les dues coses (sense monstres i levelfinished = true), el posa a false, puja la variable level en +1,
	 *	canvia el levelText indicant el valor actual de la variable level, i torna a crear monstres.
	 */
    checkMonsters():number{
        return this.game.monsters.countLiving();
    }

    checkNextLevel() {
        if(this.checkMonsters() == 0){
            this.game.levelFinished = true;
        }

        if(this.checkMonsters() == 0 && this.game.levelFinished == true) {
            this.game.levelFinished = false;
            this.game.level = this.game.level + 1;
            this.game.levelText.setText('Level: '+this.game.level);
            this.createMonsters();
        }
    }

    nextLevel(){ 
        if(this.game.levelFinished = true){
            this.game.levelFinished = false;
            this.game.level = this.game.level + 1;
            this.game.levelText.setText('Level: '+this.game.level);
            this.createMonsters();
        }
    }
	
	// Verifica si pot sumar una vida al playerquan hi ha overlap del player i l'sprite de vida. Si es aixi, suma 1 de vida i crea un altre sprite de vida.

    addLife(){
        if(this.game.player.getLives() < this.game.player.getMaxLives()){
            this.game.vida.kill();
            this.game.player.setLives();
            this.game.player.notify();
            var newX = this.rnd.between(65,535);
            var newY = this.rnd.between(65,800);
            this.game.vida.reset(newX, newY);

        }
    }

    update():void{
        super.update();
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
        this.physics.arcade.overlap(this.game.player, this.game.vida, this.addLife, null, this);

    };

	/*
	 *	Al restart, per a que no guardi dades del player, ni del level, hem de posar les variables com a l'inici. 
	 *	Destruim l'stone de vida i el player i el nivell torna a 1, aixi com canvi al levelText.
	 */
    restart() {
        this.game.vida.destroy();
        this.game.player.destroy();
        this.game.level = 1;
        this.game.levelText.setText("Level: "+this.game.level);
        this.game.state.restart();
    }
}

//FACTORY: Creació de monstres

/*
 *	És un factory senzill, tenim la classe Monstre, amb els seus atributs, un factory que crea, depenent de l'string que li passem
 *	un tipus de monstre diferent que extenden de la classe principal, Monstre.
 */

class Monster extends Phaser.Sprite{
    game:ShooterGame;
    MONSTER_HEALTH = 10;
    MONSTER_SPEED = 100;
    checked:boolean;

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
        this.checked = false;
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
	
	//Crea els monstres depenent de la key que li posem.
    createMonster(key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture):Monster{
        if(key == 'robot'){
            return new Robot(this.game, key);
        }
        if(key == 'zombie1'){
            return new Zombie1(this.game, key);
        }
        if(key == 'zombie2'){
            return new Zombie2(this.game, key);
        }
    }


}

class Robot extends Monster implements Gegant{
    constructor(game:ShooterGame, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture){
        super(game, 250, 250, key,0);
        this.MONSTER_HEALTH = 10;
        this.health = this.MONSTER_HEALTH;
        this.MONSTER_SPEED = 100;
        this.body.velocity.setTo(this.MONSTER_SPEED);
    }

    update() {
        super.update();
        this.enfadat();
    }

    enfadat(){
        if(this.health <= 5 && this.checked == false){
            this.scale.multiply(2,2);
            this.checked = true;
        }
    }
}

class Zombie1 extends Monster implements Gegant{
    constructor(game:ShooterGame, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture){
        super(game, 750, 750, key,0);
        this.MONSTER_HEALTH = 15;
        this.health = this.MONSTER_HEALTH;
        this.MONSTER_SPEED = 150;
        this.body.velocity.setTo(this.MONSTER_SPEED)

    }

    update() {
        super.update();
        this.enfadat()
    }

    enfadat(){
        if(this.health <= 6 && this.checked == false){
            this.scale.multiply(1.5,1.5);
            this.checked = true;
        }
    }

}

class Zombie2 extends Monster implements Gegant{
    constructor(game:ShooterGame, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture){
        super(game, 250, 750, key,0);
        this.MONSTER_HEALTH = 20;
        this.health = this.MONSTER_HEALTH;
        this.MONSTER_SPEED = 200;
        this.body.velocity.setTo(this.MONSTER_SPEED);
    }

    update() {
        super.update();
        this.enfadat();
    }

    enfadat(){
        if(this.health <= 7 && this.checked == false){
            this.scale.multiply(2,2);
            this.checked = true;
        }
    }
}

// STRATEGY: Els zombies es fan més grans en tant estan a prop de morir. 

/*
 *	Per tant, tenim un canvi en temps d'execució, i tot i que fan el mateix, 
 *	cadascun podria fer-ne una cosa diferent.
 */
interface Gegant {
    enfadat();
}


// OBSERVER: Notificació de puntuació al player.

/*
 *	Funcionament: El player serà qui tingui la informació, el publicador. Implementa Publisher, que son dos mètodes per subscriure
 *	i notificar. Com que només hi haurà un suscriptor, del tipus DisplayStats, no necessitem cap array, el passem com a atribut del player i inicialitzem
 *	al constructor. Seguidament el suscribim a les dades amb el suscribe().
 *	Per una altra banda tenim la classe de la qual suscriurem una instància, DisplayStats. Aquesta classe implementa la interficie Observer, per a 
 *	poder fer l'update. 
 *	Per tant:
 *	Amb l'inici del joc es crea el player, i aquest crea i suscriu una instancia de DisplayStats. En el moment que canvia alguna de les 3 informacions 
 *	(punts, vides o màxim de vides) al player, es crida inmediatament al joc al notify(), que el que fa es crida al mètode de la interfície Observer, updateStats()
 *	que actualitzarà les dades i executarà el mètode displayStats(), que imprimeix als textos la informació actualitzada.
 */

interface Publisher{ //publicador
    suscribe(displayStats);
    notify();
}

class Player extends Phaser.Sprite implements Publisher{
    game:ShooterGame;
    score:number;
    lives:number;
    max_lives = 3;
    displayStats:DisplayStats;

    constructor(score:number,lives:number, game:ShooterGame, x:number, y:number, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture, frame:string|number){
        super(game, x, y, key, frame);
        this.game = game;

        this.anchor.setTo(0.5, 0.5);
        this.score=score;
        this.lives = lives;
        this.health = this.lives;
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.maxVelocity.setTo(this.game.PLAYER_MAX_SPEED, this.game.PLAYER_MAX_SPEED);
        this.body.collideWorldBounds = true;
        this.body.drag.setTo(this.game.PLAYER_DRAG, this.game.PLAYER_DRAG);
        this.displayStats = new DisplayStats(this);
    }

    suscribe(displayStats:DisplayStats){
        this.displayStats = displayStats;
    }

    notify(){
        this.displayStats.updateStats(this.getScore(), this.getLives(), this.getMaxLives());
    }

    getScore():number{
        return this.score;
    }

    getLives():number{
        return this.lives;
    }

    getMaxLives():number{
        return this.max_lives;
    }

    setLives(){
        this.lives +=1;
        this.health = this.lives;
    }

    setMaxLives(){
        this.max_lives +=1;
    }
}

interface Observer{ //observer
    updateStats(points:number, lives:number, max_lives:number);
}

class DisplayStats implements Observer{ //display
    game:ShooterGame;
    points:number;
    lives:number;
    max_lives:number;
    player:Player;
    pointsCheck:number;
    pointsUpdate = 0;
    counter = 0;


    constructor(player:Player){
        this.player = player;
        this.player.suscribe(this);
        this.game = this.player.game;
        this.lives = this.player.lives;
        this.points = this.player.score;
        this.max_lives = this.player.max_lives;
    }

    public displayData(){
        this.game.scoreText.setText('Score: ' + this.points);
        this.game.livesText.setText('Lives: ' + this.lives);
        this.game.maxLivesText.setText('MaxLives: '+ this.max_lives);
    }

    updateStats(points:number, lives:number, max_lives:number){
        this.points = points;
        this.lives = lives;
        this.max_lives = max_lives;

        this.pointsCheck = points;
        this.checkMaxLives(this.pointsCheck);
        this.displayData();
    }
	
	// Mètode per a suma +1 al maxim de vides cada 100 punts.
    checkMaxLives(pointsCheck:number){
        pointsCheck = pointsCheck - this.pointsUpdate;

        if(pointsCheck >= 100){
            this.counter += 1;
            this.player.setMaxLives();
            this.pointsUpdate = pointsCheck*this.counter;
        }
    }
}






