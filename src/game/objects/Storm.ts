import * as Phaser from 'phaser';
import { ASSET_KEYS, GAME_HEIGHT, STORM_SIZE, STORM_SPEED } from '../../config';

// An electromagnetic storm: a big, slow, crackling yellow scribble. Touching it destroys
// your ship instantly, unless you have an EM shield to absorb it.
export class Storm extends Phaser.Physics.Arcade.Image {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, ASSET_KEYS.storm);
        this.setDepth(-1); // behind ships, but in front of the stars
    }

    spawn(x: number) {
        this.setDisplaySize(STORM_SIZE, STORM_SIZE);
        // Only the middle is dangerous, not the tips of the zig-zags.
        this.setBodySize(this.width * 0.6, this.height * 0.6);
        this.enableBody(true, x, -STORM_SIZE / 2, true, true);
        this.setVelocity(0, STORM_SPEED);
        this.setAlpha(1);
    }

    // An EM shield breaks the storm up: it stops being dangerous and fades away.
    dispel() {
        this.disableBody(false, false);
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: this.scale * 1.4,
            duration: 500,
            onComplete: () => this.disableBody(true, true),
        });
    }

    update(time: number) {
        if (this.body?.enable) {
            this.setAlpha(0.75 + 0.25 * Math.sin(time / 200)); // pulsing glow
        }
        if (this.y > GAME_HEIGHT + STORM_SIZE / 2) {
            this.disableBody(true, true);
        }
    }
}
