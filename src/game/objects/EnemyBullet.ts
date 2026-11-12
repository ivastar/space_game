import * as Phaser from 'phaser';
import { ASSET_KEYS, ENEMY_BULLET_SPEED, GAME_HEIGHT } from '../../config';

// A laser shot fired downwards by a bad ship. Pooled, like the player's Bullet.
export class EnemyBullet extends Phaser.Physics.Arcade.Image {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, ASSET_KEYS.enemyBullet);
    }

    fire(x: number, y: number) {
        this.enableBody(true, x, y, true, true);
        this.setVelocityY(ENEMY_BULLET_SPEED);
    }

    update() {
        if (this.y > GAME_HEIGHT + this.height) {
            this.disableBody(true, true);
        }
    }
}
