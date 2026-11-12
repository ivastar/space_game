import * as Phaser from 'phaser';
import { ASSET_KEYS, BULLET_SPEED, GAME_HEIGHT, GAME_WIDTH } from '../../config';

// A laser bullet. Bullets live in a pool (a Phaser group) and get reused:
// fire() wakes one up, and it puts itself back to sleep when it leaves the screen.
export class Bullet extends Phaser.Physics.Arcade.Image {
    // A bounced bullet has hit an asteroid and is harmless from then on.
    bounced = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, ASSET_KEYS.bullet);
    }

    fire(x: number, y: number) {
        this.enableBody(true, x, y, true, true);
        this.bounced = false;
        this.setAlpha(1);
        this.setVelocity(0, -BULLET_SPEED);
    }

    bounce() {
        this.bounced = true;
        this.setAlpha(0.5);
        this.setVelocity(Phaser.Math.Between(-350, 350), BULLET_SPEED * 0.5);
    }

    update() {
        const offScreen = this.y < -this.height || this.y > GAME_HEIGHT + this.height
            || this.x < -this.width || this.x > GAME_WIDTH + this.width;
        if (offScreen) {
            this.disableBody(true, true);
        }
    }
}
