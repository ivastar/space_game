import * as Phaser from 'phaser';
import {
    ASSET_KEYS, GAME_HEIGHT, SHIP_DISPLAY_SIZE, ENEMY_SPEED,
    ENEMY_ZIGZAG_AMPLITUDE, ENEMY_ZIGZAG_PERIOD, ENEMY_FIRE_INTERVAL,
} from '../../config';
import { EnemyBullet } from './EnemyBullet';

export type EnemyPattern = 'straight' | 'zigzag';

// A bad ship (one of Zak's). Pooled: spawn() wakes one up at the top of the
// screen, and it puts itself back to sleep when it flies off the bottom.
export class Enemy extends Phaser.Physics.Arcade.Image {
    private pattern: EnemyPattern = 'straight';
    private spawnedAt = 0;
    private shooter = false;
    private nextFireAt = 0;
    private enemyBullets!: Phaser.Physics.Arcade.Group;
    private health = 1; // laser hits left before it blows up

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, ASSET_KEYS.enemyGuard);
    }

    spawn(x: number, texture: string, pattern: EnemyPattern, shooter: boolean, health: number,
          enemyBullets: Phaser.Physics.Arcade.Group, time: number) {
        this.health = health;
        this.clearTint();
        this.setTexture(texture);
        this.setDisplaySize(SHIP_DISPLAY_SIZE, SHIP_DISPLAY_SIZE * (this.height / this.width));
        // Pooled enemies can switch sprite, so the hitbox must be resized to match.
        this.setBodySize(this.width, this.height);
        this.enableBody(true, x, -this.displayHeight, true, true);
        this.setVelocity(0, ENEMY_SPEED);

        this.pattern = pattern;
        this.shooter = shooter;
        this.enemyBullets = enemyBullets;
        this.spawnedAt = time;
        this.nextFireAt = time + ENEMY_FIRE_INTERVAL / 2;
    }

    // A laser hit. Returns true if that was the last hit and the ship should blow up;
    // otherwise it flashes white so you can see it got hit.
    takeHit() {
        this.health -= 1;
        if (this.health <= 0) return true;
        this.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
        this.scene.time.delayedCall(80, () => this.clearTint());
        return false;
    }

    update(time: number) {
        if (this.pattern === 'zigzag') {
            // Swing left and right around the starting x, like a sine wave.
            const omega = (2 * Math.PI) / ENEMY_ZIGZAG_PERIOD;
            const t = time - this.spawnedAt;
            this.setVelocityX(ENEMY_ZIGZAG_AMPLITUDE * omega * 1000 * Math.cos(omega * t));
        }

        if (this.shooter && this.y > 0 && time >= this.nextFireAt) {
            const shot = this.enemyBullets.get() as EnemyBullet | null;
            shot?.fire(this.x, this.y + this.displayHeight / 2);
            this.nextFireAt = time + ENEMY_FIRE_INTERVAL;
        }

        if (this.y > GAME_HEIGHT + this.displayHeight) {
            this.disableBody(true, true);
        }
    }
}
