import * as Phaser from 'phaser';
import { ASSET_KEYS, SONIC_SPEED, SONIC_WIDTH } from '../../config';

// A wave from the sonic blast cannon. It flies upwards and smashes every asteroid
// and bad ship it touches, without stopping.
export class SonicBlast extends Phaser.Physics.Arcade.Image {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, ASSET_KEYS.sonicBlast);
    }

    fire(x: number, y: number) {
        this.setDisplaySize(SONIC_WIDTH, SONIC_WIDTH * (this.height / this.width));
        this.enableBody(true, x, y, true, true);
        this.setVelocity(0, -SONIC_SPEED);
    }

    update() {
        if (this.y < -this.displayHeight) {
            this.disableBody(true, true);
        }
    }
}
