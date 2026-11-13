import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import {
    ASSET_KEYS, GAME_WIDTH, GAME_HEIGHT, SHIP_DISPLAY_SIZE,
    PLAYER_SPEED,
    BULLET_FIRE_DELAY, BULLET_POOL_SIZE,
    ENEMY_SPAWN_INTERVAL, ENEMY_POOL_SIZE, ENEMY_BULLET_POOL_SIZE,
    ENEMY_ZIGZAG_CHANCE, ENEMY_ZIGZAG_AMPLITUDE, ENEMY_SHOOTER_CHANCE,
    PART_TYPES, PARTS_DROP_MIN, PARTS_DROP_MAX, PART_POOL_SIZE,
    PLAYER_START_SHIELDS, PLAYER_INVINCIBLE_DURATION, PLAYER_FLASH_INTERVAL, GAME_OVER_DELAY,
    COIN_SPAWN_TIME, BOLT_SPAWN_TIME, ASTEROID_SPAWN_TIME, STORM_SPAWN_TIME,
    PLAYER_MAX_SHIELDS, PICKUP_POOL_SIZE, BOOST_DURATION, BOOST_SPEED_MULTIPLIER, BOOST_TINT,
    ASTEROID_POOL_SIZE, ASTEROID_SIZE, STORM_POOL_SIZE, STORM_SIZE,
    HYPERDRIVE_DROP_CHANCE, HYPERDRIVE_START_CHARGES, JUMP_RAMP_UP, JUMP_CRUISE, JUMP_RAMP_DOWN,
    JUMP_SPEED_MULTIPLIER, JUMP_OBJECTS_FADE,
} from '../../config';
import { Starfield } from '../objects/Starfield';
import type { PartType } from '../../config';
import { makeButton } from '../ui/makeButton';
import { Bullet } from '../objects/Bullet';
import { Enemy } from '../objects/Enemy';
import { EnemyBullet } from '../objects/EnemyBullet';
import { Part } from '../objects/Part';
import { Pickup } from '../objects/Pickup';
import type { PickupKind } from '../objects/Pickup';
import { Asteroid } from '../objects/Asteroid';
import { Storm } from '../objects/Storm';

export class LevelScene extends Scene {
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
    private jumpKey!: Phaser.Input.Keyboard.Key;
    private jumpCharges = 0;
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

    create() {
        this.starfield = new Starfield(this);

        this.player = this.physics.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 200, ASSET_KEYS.playerShip);
        const scale = SHIP_DISPLAY_SIZE / this.player.width;
        this.player.setDisplaySize(SHIP_DISPLAY_SIZE, this.player.height * scale);
        this.player.setDepth(5);
        this.shipHalfWidth = this.player.displayWidth / 2;
        this.shipHalfHeight = this.player.displayHeight / 2;

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.jumpKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        this.bullets = this.physics.add.group({ classType: Bullet, maxSize: BULLET_POOL_SIZE, runChildUpdate: true });
        this.enemies = this.physics.add.group({ classType: Enemy, maxSize: ENEMY_POOL_SIZE, runChildUpdate: true });
        this.enemyBullets = this.physics.add.group({ classType: EnemyBullet, maxSize: ENEMY_BULLET_POOL_SIZE, runChildUpdate: true });
        this.parts = this.physics.add.group({ classType: Part, maxSize: PART_POOL_SIZE, runChildUpdate: true });
        this.pickups = this.physics.add.group({ classType: Pickup, maxSize: PICKUP_POOL_SIZE, runChildUpdate: true });
        this.asteroids = this.physics.add.group({ classType: Asteroid, maxSize: ASTEROID_POOL_SIZE, runChildUpdate: true });
        this.storms = this.physics.add.group({ classType: Storm, maxSize: STORM_POOL_SIZE, runChildUpdate: true });
        this.lastFiredAt = 0;
        this.shields = PLAYER_START_SHIELDS;
        this.invincibleUntil = 0;
        this.boostUntil = 0;
        this.jumpCharges = HYPERDRIVE_START_CHARGES;
        this.jumping = false;
        this.dead = false;

        this.time.addEvent({
            delay: ENEMY_SPAWN_INTERVAL,
            loop: true,
            callback: () => { if (!this.jumping) this.spawnEnemy(); },
        });
        this.spawnEvery(COIN_SPAWN_TIME, () => this.spawnPickup('coin'));
        this.spawnEvery(BOLT_SPAWN_TIME, () => this.spawnPickup('bolt'));
        this.spawnEvery(ASTEROID_SPAWN_TIME, () => this.spawnAsteroid());
        this.spawnEvery(STORM_SPAWN_TIME, () => this.spawnStorm());

        this.physics.add.overlap(this.bullets, this.enemies, (b, e) => this.onBulletHitsEnemy(b as Bullet, e as Enemy));
        this.physics.add.overlap(this.bullets, this.asteroids, (b) => this.onBulletHitsAsteroid(b as Bullet));
        this.physics.add.overlap(this.player, this.parts, (_p, part) => this.onCollectPart(part as Part));
        this.physics.add.overlap(this.player, this.pickups, (_p, pickup) => this.onCollectPickup(pickup as Pickup));
        this.physics.add.overlap(this.player, this.enemyBullets, (_p, b) => this.onPlayerHitByBullet(b as EnemyBullet));
        this.physics.add.overlap(this.player, this.enemies, (_p, e) => this.onPlayerHitsEnemy(e as Enemy));
        this.physics.add.overlap(this.player, this.asteroids, () => this.onPlayerHitsAsteroid());
        this.physics.add.overlap(this.player, this.storms, (_p, s) => this.onPlayerTouchesStorm(s as Storm));

        makeButton(this, 110, 60, 'Station', () => this.scene.start('StationScene'));

        this.partsText = this.add.text(20, 110, '', {
            fontFamily: 'Arial', fontSize: 28, color: '#ffffff',
        }).setDepth(10);
        this.updatePartsText();

        this.shieldIcons = [];
        this.updateShieldIcons();

        this.add.image(GAME_WIDTH - 95, 110, ASSET_KEYS.hyperdriveToken).setDepth(10);
        this.chargesText = this.add.text(GAME_WIDTH - 72, 110, '', {
            fontFamily: 'Arial', fontSize: 28, color: '#ffffff',
        }).setOrigin(0, 0.5).setDepth(10);
        this.updateChargesText();
    }

    update(time: number, delta: number) {
        const dt = delta / 1000;

        this.starfield.update(dt);

        if (this.dead) return;

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
        if (!boosted && this.player.isTinted) {
            this.player.clearTint();
        }
        const speed = boosted ? PLAYER_SPEED * BOOST_SPEED_MULTIPLIER : PLAYER_SPEED;

        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            this.player.x += (dx / length) * speed * dt;
            this.player.y += (dy / length) * speed * dt;
        }

        this.player.x = Phaser.Math.Clamp(this.player.x, this.shipHalfWidth, GAME_WIDTH - this.shipHalfWidth);
        this.player.y = Phaser.Math.Clamp(this.player.y, this.shipHalfHeight, GAME_HEIGHT - this.shipHalfHeight);

        if (!this.jumping && this.cursors.space.isDown && time - this.lastFiredAt >= BULLET_FIRE_DELAY) {
            this.fire(time);
        }
    }

    private fire(time: number) {
        const bullet = this.bullets.get() as Bullet | null;
        if (!bullet) return; // pool is full; wait for a bullet to leave the screen
        bullet.fire(this.player.x, this.player.y - this.shipHalfHeight);
        this.lastFiredAt = time;
    }

    private spawnEnemy() {
        const enemy = this.enemies.get() as Enemy | null;
        if (!enemy) return;

        const zigzag = Math.random() < ENEMY_ZIGZAG_CHANCE;
        // Keep zig-zaggers far enough from the edges that their swing stays on screen.
        const margin = SHIP_DISPLAY_SIZE / 2 + (zigzag ? ENEMY_ZIGZAG_AMPLITUDE : 0);
        const x = Phaser.Math.Between(margin, GAME_WIDTH - margin);
        const texture = Math.random() < 0.5 ? ASSET_KEYS.enemyGuard : ASSET_KEYS.enemyBot;
        const shooter = Math.random() < ENEMY_SHOOTER_CHANCE;

        enemy.spawn(x, texture, zigzag ? 'zigzag' : 'straight', shooter, this.enemyBullets, this.time.now);
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

        for (const group of [this.bullets, this.enemies, this.enemyBullets, this.parts, this.pickups, this.asteroids, this.storms]) {
            for (const obj of group.getMatching('active', true) as Phaser.Physics.Arcade.Image[]) {
                this.vanish(obj);
            }
        }

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
        this.player.enableBody(); // collisions are back
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

    private updateChargesText() {
        this.chargesText.setText(`x ${this.jumpCharges}`);
    }

    // Calls spawn() over and over, waiting a random time in [min, max] ms in between.
    // Nothing new appears during a jump.
    private spawnEvery([min, max]: [number, number], spawn: () => void) {
        this.time.delayedCall(Phaser.Math.Between(min, max), () => {
            if (!this.jumping) spawn();
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
        const emShields = (this.registry.get('emShields') as number | undefined) ?? 0;
        if (emShields > 0) {
            this.registry.set('emShields', emShields - 1);
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
            this.player.setTint(BOOST_TINT);
        } else {
            this.jumpCharges += 1;
            this.updateChargesText();
        }
    }

    private onBulletHitsEnemy(bullet: Bullet, enemy: Enemy) {
        if (!bullet.active || !enemy.active || bullet.bounced) return;
        const { x, y } = enemy;
        bullet.disableBody(true, true);
        enemy.disableBody(true, true);
        this.explode(x, y);
        this.dropParts(x, y);
        if (Math.random() < HYPERDRIVE_DROP_CHANCE) {
            this.spawnPickup('hyperdrive', x, y);
        }
    }

    private explode(x: number, y: number) {
        const boom = this.add.circle(x, y, 18, 0xffaa33).setDepth(6);
        this.tweens.add({
            targets: boom,
            scale: 3,
            alpha: 0,
            duration: 300,
            onComplete: () => boom.destroy(),
        });
    }

    private dropParts(x: number, y: number) {
        const count = Phaser.Math.Between(PARTS_DROP_MIN, PARTS_DROP_MAX);
        for (let i = 0; i < count; i++) {
            const part = this.parts.get() as Part | null;
            if (!part) return;
            part.drop(x, y, Phaser.Utils.Array.GetRandom([...PART_TYPES]));
        }
    }

    private onCollectPart(part: Part) {
        if (!part.active) return;
        part.disableBody(true, true);
        const inventory = { ...(this.registry.get('parts') as Record<PartType, number>) };
        inventory[part.partType] += 1;
        this.registry.set('parts', inventory);
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
        const inventory = this.registry.get('parts') as Record<PartType, number>;
        const total = PART_TYPES.reduce((sum, t) => sum + inventory[t], 0);
        this.partsText.setText(`Parts: ${total}`);
    }
}
