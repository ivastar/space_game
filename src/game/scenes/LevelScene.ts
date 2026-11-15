import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import {
    ASSET_KEYS, GAME_WIDTH, GAME_HEIGHT, SHIP_DISPLAY_SIZE,
    PLAYER_SPEED,
    BULLET_FIRE_DELAY, BULLET_POOL_SIZE,
    ENEMY_POOL_SIZE, ENEMY_BULLET_POOL_SIZE,
    ENEMY_ZIGZAG_CHANCE, ENEMY_ZIGZAG_AMPLITUDE,
    PART_TYPES, PART_POOL_SIZE,
    PLAYER_INVINCIBLE_DURATION, PLAYER_FLASH_INTERVAL, GAME_OVER_DELAY,
    COIN_SPAWN_TIME, BOLT_SPAWN_TIME,
    PLAYER_MAX_SHIELDS, PICKUP_POOL_SIZE, BOOST_DURATION, BOOST_SPEED_MULTIPLIER, BOOST_TINT,
    ASTEROID_POOL_SIZE, ASTEROID_SIZE, STORM_POOL_SIZE, STORM_SIZE,
    HYPERDRIVE_DROP_CHANCE, HYPERDRIVE_START_CHARGES, HYPERDRIVE_TOKENS_PER_JUMP, JUMP_RAMP_UP, JUMP_CRUISE, JUMP_RAMP_DOWN,
    JUMP_SPEED_MULTIPLIER, JUMP_OBJECTS_FADE,
    LEVELS, JUMP_DISTANCE_FACTOR, ARRIVAL_DELAY,
    SPEED_UPGRADE_STEP, FIRE_RATE_UPGRADE_STEP, SONIC_FIRE_DELAY, SONIC_POOL_SIZE,
    SHIPS, NEW_THING_ORDER, NEW_THING_NAMES, NEW_THING_BANNER_TIME, BOT_SHIP_CHANCE, BOT_SHIP_HEALTH, isIntroduced,
} from '../../config';
import { Starfield } from '../objects/Starfield';
import type { LevelSettings, NewThing, ShipSettings } from '../../config';
import { getGameState, startingShields } from '../GameState';
import type { GameState } from '../GameState';
import { SonicBlast } from '../objects/SonicBlast';
import { ProgressBar } from '../ui/ProgressBar';
import { Bullet } from '../objects/Bullet';
import { Enemy } from '../objects/Enemy';
import { EnemyBullet } from '../objects/EnemyBullet';
import { Part } from '../objects/Part';
import { Pickup } from '../objects/Pickup';
import type { PickupKind } from '../objects/Pickup';
import { Asteroid } from '../objects/Asteroid';
import { Storm } from '../objects/Storm';

export class LevelScene extends Scene {
    private state!: GameState;
    private level!: LevelSettings;
    private playerSpeed = 0; // includes the engine upgrade
    private fireDelay = 0; // includes the laser upgrade
    private sonicKey!: Phaser.Input.Keyboard.Key;
    private sonicBlasts!: Phaser.Physics.Arcade.Group;
    private lastSonicAt = 0;
    private gearText!: Phaser.GameObjects.Text;
    private distance = 0; // how far along the trip we are, in seconds of normal flying
    private arrived = false;
    private progressBar!: ProgressBar;
    private starfield!: Starfield;
    private player!: Phaser.Physics.Arcade.Image;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private bullets!: Phaser.Physics.Arcade.Group;
    private enemies!: Phaser.Physics.Arcade.Group;
    private enemyBullets!: Phaser.Physics.Arcade.Group;
    private parts!: Phaser.Physics.Arcade.Group;
    private pickups!: Phaser.Physics.Arcade.Group;
    private asteroids!: Phaser.Physics.Arcade.Group;
    private storms!: Phaser.Physics.Arcade.Group;
    private partsText!: Phaser.GameObjects.Text;
    private boostUntil = 0;
    private boosting = false;
    private ship!: ShipSettings;
    private jumpKey!: Phaser.Input.Keyboard.Key;
    private jumpCharges = 0;
    private jumpTokens = 0; // tokens collected towards the next jump
    private tokenIcon!: Phaser.GameObjects.Image;
    private jumping = false;
    private chargesText!: Phaser.GameObjects.Text;
    private shieldIcons: Phaser.GameObjects.Image[] = [];
    private shields = 0;
    private invincibleUntil = 0;
    private dead = false;
    private lastFiredAt = 0;
    private shipHalfWidth = 0;
    private shipHalfHeight = 0;

    constructor() {
        super('LevelScene');
    }

    // Which level to fly comes from the galaxy map. Retry doesn't pass one, so it
    // replays the level you were on.
    init(data: { levelIndex?: number }) {
        this.state = getGameState(this);
        this.state.currentLevel = data.levelIndex ?? this.state.currentLevel;
        this.level = LEVELS[this.state.currentLevel];
    }

    create() {
        // Your ship's own stats, then marketplace upgrades on top.
        this.ship = SHIPS[this.state.activeShip];
        this.playerSpeed = PLAYER_SPEED * this.ship.speed * (1 + SPEED_UPGRADE_STEP * this.state.upgrades.speed);
        this.fireDelay = BULLET_FIRE_DELAY * this.ship.fireDelay * (1 - FIRE_RATE_UPGRADE_STEP * this.state.upgrades.fireRate);
        this.distance = 0;
        this.arrived = false;
        this.boosting = false;
        this.starfield = new Starfield(this);

        this.player = this.physics.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 200, this.ship.sprite);
        this.player.setDisplaySize(this.ship.displayWidth, this.ship.displayWidth * (this.player.height / this.player.width));
        this.player.setTint(this.ship.tint);
        this.player.setDepth(5);
        this.shipHalfWidth = this.player.displayWidth / 2;
        this.shipHalfHeight = this.player.displayHeight / 2;

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.jumpKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.sonicKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        this.bullets = this.physics.add.group({ classType: Bullet, maxSize: BULLET_POOL_SIZE, runChildUpdate: true });
        this.enemies = this.physics.add.group({ classType: Enemy, maxSize: ENEMY_POOL_SIZE, runChildUpdate: true });
        this.enemyBullets = this.physics.add.group({ classType: EnemyBullet, maxSize: ENEMY_BULLET_POOL_SIZE, runChildUpdate: true });
        this.parts = this.physics.add.group({ classType: Part, maxSize: PART_POOL_SIZE, runChildUpdate: true });
        this.pickups = this.physics.add.group({ classType: Pickup, maxSize: PICKUP_POOL_SIZE, runChildUpdate: true });
        this.asteroids = this.physics.add.group({ classType: Asteroid, maxSize: ASTEROID_POOL_SIZE, runChildUpdate: true });
        this.storms = this.physics.add.group({ classType: Storm, maxSize: STORM_POOL_SIZE, runChildUpdate: true });
        this.sonicBlasts = this.physics.add.group({ classType: SonicBlast, maxSize: SONIC_POOL_SIZE, runChildUpdate: true });
        this.lastFiredAt = 0;
        this.lastSonicAt = 0;
        // Extra lives from the marketplace are used up on this trip.
        this.shields = startingShields(this.state);
        this.state.extraLives = 0;
        this.invincibleUntil = 0;
        this.boostUntil = 0;
        this.jumpCharges = HYPERDRIVE_START_CHARGES;
        this.jumpTokens = 0;
        this.jumping = false;
        this.dead = false;

        this.time.addEvent({
            delay: this.level.enemySpawnInterval,
            loop: true,
            callback: () => { if (this.canSpawn()) this.spawnEnemy(); },
        });
        // Only things that have been introduced by this level appear (see NEW_THING_ORDER).
        if (this.has('coins')) this.spawnEvery(COIN_SPAWN_TIME, () => this.spawnPickup('coin'));
        if (this.has('lightning')) this.spawnEvery(BOLT_SPAWN_TIME, () => this.spawnPickup('bolt'));
        if (this.has('asteroids')) this.spawnEvery(this.level.asteroidSpawnTime, () => this.spawnAsteroid());
        if (this.has('storms')) this.spawnEvery(this.level.stormSpawnTime, () => this.spawnStorm());

        this.physics.add.overlap(this.bullets, this.enemies, (b, e) => this.onBulletHitsEnemy(b as Bullet, e as Enemy));
        this.physics.add.overlap(this.bullets, this.asteroids, (b) => this.onBulletHitsAsteroid(b as Bullet));
        this.physics.add.overlap(this.sonicBlasts, this.asteroids, (_s, a) => this.smashAsteroid(a as Asteroid));
        this.physics.add.overlap(this.sonicBlasts, this.enemies, (_s, e) => this.destroyEnemy(e as Enemy));
        this.physics.add.overlap(this.player, this.parts, (_p, part) => this.onCollectPart(part as Part));
        this.physics.add.overlap(this.player, this.pickups, (_p, pickup) => this.onCollectPickup(pickup as Pickup));
        this.physics.add.overlap(this.player, this.enemyBullets, (_p, b) => this.onPlayerHitByBullet(b as EnemyBullet));
        this.physics.add.overlap(this.player, this.enemies, (_p, e) => this.onPlayerHitsEnemy(e as Enemy));
        this.physics.add.overlap(this.player, this.asteroids, () => this.onPlayerHitsAsteroid());
        this.physics.add.overlap(this.player, this.storms, (_p, s) => this.onPlayerTouchesStorm(s as Storm));

        this.progressBar = new ProgressBar(this, `Trip to ${this.level.name}`, 20, 60, 400);

        this.partsText = this.add.text(20, 110, '', {
            fontFamily: 'Arial', fontSize: 28, color: '#ffffff',
        }).setDepth(10);
        this.updatePartsText();

        this.gearText = this.add.text(20, 148, '', {
            fontFamily: 'Arial', fontSize: 20, color: '#9fd0ff',
        }).setDepth(10);
        this.updateGearText();

        this.shieldIcons = [];
        this.updateShieldIcons();

        this.tokenIcon = this.add.image(0, 110, ASSET_KEYS.hyperdriveToken).setDepth(10);
        this.chargesText = this.add.text(GAME_WIDTH - 20, 110, '', {
            fontFamily: 'Arial', fontSize: 26, color: '#ffffff',
        }).setOrigin(1, 0.5).setDepth(10);
        this.updateChargesText();
        // Tokens and jumps only matter once hyperdrive tokens have been introduced.
        this.tokenIcon.setVisible(this.has('hyperdriveTokens'));
        this.chargesText.setVisible(this.has('hyperdriveTokens'));

        this.showNewThingBanner();
    }

    // Has this thing been introduced by this level?
    private has(thing: NewThing) {
        return isIntroduced(thing, this.state.currentLevel);
    }

    // If this level brings in something new, say so for a few seconds at the start.
    private showNewThingBanner() {
        const thing = NEW_THING_ORDER[this.state.currentLevel];
        if (!thing) return;
        const banner = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150, `NEW!\n${NEW_THING_NAMES[thing]}`, {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffe14f', align: 'center',
            stroke: '#000000', strokeThickness: 6, wordWrap: { width: GAME_WIDTH - 80 },
        }).setOrigin(0.5).setDepth(10);
        this.tweens.add({
            targets: banner,
            alpha: 0,
            delay: NEW_THING_BANNER_TIME - 500,
            duration: 500,
            onComplete: () => banner.destroy(),
        });
    }

    update(time: number, delta: number) {
        const dt = delta / 1000;

        this.starfield.update(dt);

        if (this.dead || this.arrived) return;

        // During a jump the stars race by, and part of that extra speed counts as distance too.
        this.distance += dt * (1 + (this.starfield.speedMultiplier - 1) * JUMP_DISTANCE_FACTOR);
        this.progressBar.show(this.distance / this.level.tripLength);
        if (this.distance >= this.level.tripLength) {
            this.arrive();
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.jumpKey)) {
            this.tryJump();
        }

        let dx = 0;
        let dy = 0;
        if (this.cursors.left.isDown) dx -= 1;
        if (this.cursors.right.isDown) dx += 1;
        if (this.cursors.up.isDown) dy -= 1;
        if (this.cursors.down.isDown) dy += 1;

        const boosted = time < this.boostUntil;
        if (this.boosting && !boosted) {
            this.boosting = false;
            this.player.setTint(this.ship.tint); // back to the ship's own colour
        }
        const speed = boosted ? this.playerSpeed * BOOST_SPEED_MULTIPLIER : this.playerSpeed;

        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            this.player.x += (dx / length) * speed * dt;
            this.player.y += (dy / length) * speed * dt;
        }

        this.player.x = Phaser.Math.Clamp(this.player.x, this.shipHalfWidth, GAME_WIDTH - this.shipHalfWidth);
        this.player.y = Phaser.Math.Clamp(this.player.y, this.shipHalfHeight, GAME_HEIGHT - this.shipHalfHeight);

        if (!this.jumping && this.cursors.space.isDown && time - this.lastFiredAt >= this.fireDelay) {
            this.fire(time);
        }
        if (!this.jumping && this.state.hasSonicCannon && this.sonicKey.isDown && time - this.lastSonicAt >= SONIC_FIRE_DELAY) {
            this.fireSonic(time);
        }
    }

    private fire(time: number) {
        const bullet = this.bullets.get() as Bullet | null;
        if (!bullet) return; // pool is full; wait for a bullet to leave the screen
        bullet.fire(this.player.x, this.player.y - this.shipHalfHeight);
        this.lastFiredAt = time;
    }

    private fireSonic(time: number) {
        const blast = this.sonicBlasts.get() as SonicBlast | null;
        if (!blast) return;
        blast.fire(this.player.x, this.player.y - this.shipHalfHeight);
        this.lastSonicAt = time;
    }

    private smashAsteroid(asteroid: Asteroid) {
        if (!asteroid.active) return;
        this.explode(asteroid.x, asteroid.y, 0x9a8f84);
        asteroid.disableBody(true, true);
    }

    private spawnEnemy() {
        const enemy = this.enemies.get() as Enemy | null;
        if (!enemy) return;

        const zigzag = this.has('zigzagShips') && Math.random() < ENEMY_ZIGZAG_CHANCE;
        const shooter = this.has('shooterShips') && Math.random() < this.level.enemyShooterChance;
        const bot = this.has('botShips') && Math.random() < BOT_SHIP_CHANCE;
        // Keep zig-zaggers far enough from the edges that their swing stays on screen.
        const margin = SHIP_DISPLAY_SIZE / 2 + (zigzag ? ENEMY_ZIGZAG_AMPLITUDE : 0);
        const x = Phaser.Math.Between(margin, GAME_WIDTH - margin);

        enemy.spawn(
            x,
            bot ? ASSET_KEYS.enemyBot : ASSET_KEYS.enemyGuard,
            zigzag ? 'zigzag' : 'straight',
            shooter,
            bot ? BOT_SHIP_HEALTH : 1,
            this.enemyBullets,
            this.time.now,
        );
    }

    // Uses one hyperdrive charge to jump, Star Wars style: everything else vanishes, the stars
    // speed up slowly at first and then faster and faster into long streaks, cruise, and slow back down.
    private tryJump() {
        if (this.jumping) return;
        if (this.jumpCharges === 0) {
            // No charges: flash the counter red so you can see why nothing happened.
            this.chargesText.setColor('#ff4444');
            this.time.delayedCall(300, () => this.chargesText.setColor('#ffffff'));
            return;
        }

        this.jumpCharges -= 1;
        this.updateChargesText();
        this.jumping = true;

        // No body means no collisions: you pass straight through everything during the jump.
        this.player.disableBody(false, false);
        this.clearSpace();

        this.tweens.add({
            targets: this.starfield,
            speedMultiplier: JUMP_SPEED_MULTIPLIER,
            duration: JUMP_RAMP_UP,
            ease: 'Cubic.easeIn',
            completeDelay: JUMP_CRUISE,
            onComplete: () => {
                this.tweens.add({
                    targets: this.starfield,
                    speedMultiplier: 1,
                    duration: JUMP_RAMP_DOWN,
                    ease: 'Cubic.easeOut',
                    onComplete: () => this.endJump(),
                });
            },
        });
    }

    private endJump() {
        this.jumping = false;
        if (!this.arrived) {
            this.player.enableBody(); // collisions are back
        }
    }

    // You made it! Space clears, your ship flies off the top of the screen, and then
    // you dock at the star system's station.
    private arrive() {
        this.arrived = true;
        if (!this.state.completed.includes(this.level.name)) {
            this.state.completed.push(this.level.name);
        }
        this.state.location = this.level.name;
        this.progressBar.show(1);
        this.player.disableBody(false, false);
        this.clearSpace();

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, `Arriving at ${this.level.name}!`, {
            fontFamily: 'Arial Black', fontSize: 44, color: '#ffffff',
        }).setOrigin(0.5).setDepth(10);

        this.tweens.add({
            targets: this.player,
            y: -this.player.displayHeight,
            duration: ARRIVAL_DELAY * 0.6,
            ease: 'Cubic.easeIn',
        });
        this.time.delayedCall(ARRIVAL_DELAY, () => this.scene.start('StationScene'));
    }

    private canSpawn() {
        return !this.jumping && !this.arrived;
    }

    // Makes every ship, asteroid, coin, storm, part and laser on screen vanish.
    private clearSpace() {
        for (const group of [this.bullets, this.sonicBlasts, this.enemies, this.enemyBullets, this.parts, this.pickups, this.asteroids, this.storms]) {
            for (const obj of group.getMatching('active', true) as Phaser.Physics.Arcade.Image[]) {
                this.vanish(obj);
            }
        }
    }

    // Fades an object out and puts it back in its pool. It stops moving and can't
    // hit anything straight away, and stops doing things like shooting.
    private vanish(obj: Phaser.Physics.Arcade.Image) {
        obj.disableBody(false, false);
        obj.setActive(false);
        this.tweens.add({
            targets: obj,
            alpha: 0,
            duration: JUMP_OBJECTS_FADE,
            onComplete: () => {
                obj.setVisible(false);
                obj.setAlpha(1);
            },
        });
    }

    // e.g. "2/3   Jumps: 1" — tokens towards the next jump, and jumps you can use now.
    private updateChargesText() {
        this.chargesText.setText(`${this.jumpTokens}/${HYPERDRIVE_TOKENS_PER_JUMP}   Jumps: ${this.jumpCharges}`);
        this.tokenIcon.setX(this.chargesText.x - this.chargesText.width - 22);
    }

    // Calls spawn() over and over, waiting a random time in [min, max] ms in between.
    // Nothing new appears during a jump or after you've arrived.
    private spawnEvery([min, max]: [number, number], spawn: () => void) {
        this.time.delayedCall(Phaser.Math.Between(min, max), () => {
            if (this.canSpawn()) spawn();
            this.spawnEvery([min, max], spawn);
        });
    }

    private spawnPickup(kind: PickupKind, x = Phaser.Math.Between(40, GAME_WIDTH - 40), y?: number) {
        const pickup = this.pickups.get() as Pickup | null;
        pickup?.spawn(x, kind, y);
    }

    private spawnAsteroid() {
        const asteroid = this.asteroids.get() as Asteroid | null;
        const margin = ASTEROID_SIZE[1] / 2;
        asteroid?.spawn(Phaser.Math.Between(margin, GAME_WIDTH - margin));
    }

    private spawnStorm() {
        const storm = this.storms.get() as Storm | null;
        // Storms can hang partly off the edge, so there's always a way around them.
        storm?.spawn(Phaser.Math.Between(STORM_SIZE / 4, GAME_WIDTH - STORM_SIZE / 4));
    }

    private onBulletHitsAsteroid(bullet: Bullet) {
        if (!bullet.active || bullet.bounced) return;
        bullet.bounce();
    }

    private onPlayerHitsAsteroid() {
        if (this.isInvincible()) return;
        this.takeHit();
    }

    // Storms are instant death — unless you have an EM shield, which breaks the storm up and is used up.
    private onPlayerTouchesStorm(storm: Storm) {
        if (this.dead || !storm.body?.enable) return;
        if (this.state.emShields > 0) {
            this.state.emShields -= 1;
            this.updateGearText();
            storm.dispel();
            return;
        }
        this.die();
    }

    private onCollectPickup(pickup: Pickup) {
        if (!pickup.active) return;
        pickup.disableBody(true, true);
        if (pickup.kind === 'coin') {
            if (this.shields < PLAYER_MAX_SHIELDS) {
                this.shields += 1;
                this.updateShieldIcons();
            }
        } else if (pickup.kind === 'bolt') {
            this.boostUntil = this.time.now + BOOST_DURATION;
            this.boosting = true;
            this.player.setTint(BOOST_TINT);
        } else {
            this.jumpTokens += 1;
            if (this.jumpTokens >= HYPERDRIVE_TOKENS_PER_JUMP) {
                this.jumpTokens = 0;
                this.jumpCharges += 1;
            }
            this.updateChargesText();
        }
    }

    private onBulletHitsEnemy(bullet: Bullet, enemy: Enemy) {
        if (!bullet.active || !enemy.active || bullet.bounced) return;
        bullet.disableBody(true, true);
        if (enemy.takeHit()) {
            this.destroyEnemy(enemy);
        }
    }

    // A bad ship blows up and drops one part (and sometimes a hyperdrive token).
    private destroyEnemy(enemy: Enemy) {
        if (!enemy.active) return;
        const { x, y } = enemy;
        enemy.disableBody(true, true);
        this.explode(x, y);
        this.dropPart(x, y);
        if (this.has('hyperdriveTokens') && Math.random() < HYPERDRIVE_DROP_CHANCE) {
            this.spawnPickup('hyperdrive', x, y);
        }
    }

    private explode(x: number, y: number, color = 0xffaa33) {
        const boom = this.add.circle(x, y, 18, color).setDepth(6);
        this.tweens.add({
            targets: boom,
            scale: 3,
            alpha: 0,
            duration: 300,
            onComplete: () => boom.destroy(),
        });
    }

    private dropPart(x: number, y: number) {
        const part = this.parts.get() as Part | null;
        part?.drop(x, y, Phaser.Utils.Array.GetRandom([...PART_TYPES]));
    }

    private onCollectPart(part: Part) {
        if (!part.active) return;
        part.disableBody(true, true);
        this.state.parts[part.partType] += this.ship.partsPerPickup;
        this.updatePartsText();
    }

    private onPlayerHitByBullet(bullet: EnemyBullet) {
        if (!bullet.active || this.isInvincible()) return;
        bullet.disableBody(true, true);
        this.takeHit();
    }

    private onPlayerHitsEnemy(enemy: Enemy) {
        if (!enemy.active || this.isInvincible()) return;
        this.explode(enemy.x, enemy.y);
        enemy.disableBody(true, true);
        this.takeHit();
    }

    private isInvincible() {
        return this.dead || this.time.now < this.invincibleUntil;
    }

    // Each hit uses up one shield. A hit with no shields left destroys the ship.
    private takeHit() {
        if (this.shields === 0) {
            this.die();
            return;
        }
        this.shields -= 1;
        this.updateShieldIcons();

        this.invincibleUntil = this.time.now + PLAYER_INVINCIBLE_DURATION;
        this.tweens.add({
            targets: this.player,
            alpha: 0.2,
            duration: PLAYER_FLASH_INTERVAL,
            yoyo: true,
            repeat: Math.floor(PLAYER_INVINCIBLE_DURATION / (2 * PLAYER_FLASH_INTERVAL)) - 1,
            onComplete: () => this.player.setAlpha(1),
        });
    }

    private die() {
        this.dead = true;
        this.explode(this.player.x, this.player.y);
        this.player.disableBody(true, true);
        this.time.delayedCall(GAME_OVER_DELAY, () => this.scene.start('GameOverScene'));
    }

    private updateShieldIcons() {
        for (const icon of this.shieldIcons) icon.destroy();
        this.shieldIcons = [];
        for (let i = 0; i < this.shields; i++) {
            const icon = this.add.image(GAME_WIDTH - 30 - i * 38, 60, ASSET_KEYS.shieldIcon).setDepth(10);
            this.shieldIcons.push(icon);
        }
    }

    private updatePartsText() {
        const total = PART_TYPES.reduce((sum, t) => sum + this.state.parts[t], 0);
        this.partsText.setText(`Parts: ${total}`);
    }

    // A reminder of the marketplace gear you have on board.
    private updateGearText() {
        const gear: string[] = [];
        if (this.state.hasSonicCannon) gear.push('Sonic cannon: press X');
        if (this.state.emShields > 0) gear.push(`EM shield x${this.state.emShields}`);
        this.gearText.setText(gear.join('   '));
    }
}
