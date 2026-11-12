import * as Phaser from 'phaser';
import { ASSET_KEYS, BULLET_SPEED } from '../../config';

// A laser bullet. Bullets live in a pool (a Phaser group) and get reused:
// fire() wakes one up, and it puts itself back to sleep when it leaves the screen.
export class Bullet extends Phaser.Physics.Arcade.Image {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, ASSET_KEYS.bullet);
    }

    fire(x: number, y: number) {
        this.enableBody(true, x, y, true, true);
        this.setVelocityY(-BULLET_SPEED);
    }

    update() {
        if (this.active && this.y < -this.height) {
            this.disableBody(true, true);
        }
    }
}
