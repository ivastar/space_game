import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import {
    ASSET_KEYS, GAME_WIDTH, GAME_HEIGHT, SHIP_DISPLAY_SIZE,
    PLAYER_SPEED, STAR_SCROLL_SPEED_FAR, STAR_SCROLL_SPEED_NEAR,
    BULLET_FIRE_DELAY, BULLET_POOL_SIZE,
    ENEMY_SPAWN_INTERVAL, ENEMY_POOL_SIZE, ENEMY_BULLET_POOL_SIZE,
    ENEMY_ZIGZAG_CHANCE, ENEMY_ZIGZAG_AMPLITUDE, ENEMY_SHOOTER_CHANCE,
    PART_TYPES, PARTS_DROP_MIN, PARTS_DROP_MAX, PART_POOL_SIZE,
    PLAYER_START_SHIELDS, PLAYER_INVINCIBLE_DURATION, PLAYER_FLASH_INTERVAL, GAME_OVER_DELAY,
} from '../../config';
import type { PartType } from '../../config';
import { makeButton } from '../ui/makeButton';
import { Bullet } from '../objects/Bullet';
import { Enemy } from '../objects/Enemy';
import { EnemyBullet } from '../objects/EnemyBullet';
import { Part } from '../objects/Part';

export class LevelScene extends Scene {
    private starsFar!: Phaser.GameObjects.TileSprite;
    private starsNear!: Phaser.GameObjects.TileSprite;
    private player!: Phaser.Physics.Arcade.Image;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private bullets!: Phaser.Physics.Arcade.Group;
    private enemies!: Phaser.Physics.Arcade.Group;
    private enemyBullets!: Phaser.Physics.Arcade.Group;
    private parts!: Phaser.Physics.Arcade.Group;
    private partsText!: Phaser.GameObjects.Text;
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
        this.starsFar = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, ASSET_KEYS.starsFar);
        this.starsNear = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, ASSET_KEYS.starsNear);

        this.player = this.physics.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 200, ASSET_KEYS.playerShip);
        const scale = SHIP_DISPLAY_SIZE / this.player.width;
        this.player.setDisplaySize(SHIP_DISPLAY_SIZE, this.player.height * scale);
        this.player.setDepth(5);
        this.shipHalfWidth = this.player.displayWidth / 2;
        this.shipHalfHeight = this.player.displayHeight / 2;

        this.cursors = this.input.keyboard!.createCursorKeys();

        this.bullets = this.physics.add.group({ classType: Bullet, maxSize: BULLET_POOL_SIZE, runChildUpdate: true });
        this.enemies = this.physics.add.group({ classType: Enemy, maxSize: ENEMY_POOL_SIZE, runChildUpdate: true });
        this.enemyBullets = this.physics.add.group({ classType: EnemyBullet, maxSize: ENEMY_BULLET_POOL_SIZE, runChildUpdate: true });
        this.parts = this.physics.add.group({ classType: Part, maxSize: PART_POOL_SIZE, runChildUpdate: true });
        this.lastFiredAt = 0;
        this.shields = PLAYER_START_SHIELDS;
        this.invincibleUntil = 0;
        this.dead = false;

        this.time.addEvent({ delay: ENEMY_SPAWN_INTERVAL, loop: true, callback: () => this.spawnEnemy() });

        this.physics.add.overlap(this.bullets, this.enemies, (b, e) => this.onBulletHitsEnemy(b as Bullet, e as Enemy));
        this.physics.add.overlap(this.player, this.parts, (_p, part) => this.onCollectPart(part as Part));
        this.physics.add.overlap(this.player, this.enemyBullets, (_p, b) => this.onPlayerHitByBullet(b as EnemyBullet));
        this.physics.add.overlap(this.player, this.enemies, (_p, e) => this.onPlayerHitsEnemy(e as Enemy));

        makeButton(this, 110, 60, 'Station', () => this.scene.start('StationScene'));

        this.partsText = this.add.text(20, 110, '', {
            fontFamily: 'Arial', fontSize: 28, color: '#ffffff',
        }).setDepth(10);
        this.updatePartsText();

        this.shieldIcons = [];
        this.updateShieldIcons();
    }

    update(time: number, delta: number) {
        const dt = delta / 1000;

        this.starsFar.tilePositionY -= STAR_SCROLL_SPEED_FAR * dt;
        this.starsNear.tilePositionY -= STAR_SCROLL_SPEED_NEAR * dt;

        if (this.dead) return;

        let dx = 0;
        let dy = 0;
        if (this.cursors.left.isDown) dx -= 1;
        if (this.cursors.right.isDown) dx += 1;
        if (this.cursors.up.isDown) dy -= 1;
        if (this.cursors.down.isDown) dy += 1;

        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            this.player.x += (dx / length) * PLAYER_SPEED * dt;
            this.player.y += (dy / length) * PLAYER_SPEED * dt;
        }

        this.player.x = Phaser.Math.Clamp(this.player.x, this.shipHalfWidth, GAME_WIDTH - this.shipHalfWidth);
        this.player.y = Phaser.Math.Clamp(this.player.y, this.shipHalfHeight, GAME_HEIGHT - this.shipHalfHeight);

        if (this.cursors.space.isDown && time - this.lastFiredAt >= BULLET_FIRE_DELAY) {
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

    private onBulletHitsEnemy(bullet: Bullet, enemy: Enemy) {
        if (!bullet.active || !enemy.active) return;
        const { x, y } = enemy;
        bullet.disableBody(true, true);
        enemy.disableBody(true, true);
        this.explode(x, y);
        this.dropParts(x, y);
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
