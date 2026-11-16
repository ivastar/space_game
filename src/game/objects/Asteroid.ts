import * as Phaser from 'phaser';
import { ASSET_KEYS, ASTEROID_SIZE, ASTEROID_SPEED, GAME_HEIGHT } from '../../config';

// A space rock. It hurts to fly into, and normal lasers bounce off it —
// only the sonic blast cannon (from the marketplace) can break it.
export class Asteroid extends Phaser.Physics.Arcade.Image {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, ASSET_KEYS.asteroid);
    }

    spawn(x: number) {
        // Brown or grey, like the two rocks in Sasha's drawing.
        this.setTexture(Math.random() < 0.5 ? ASSET_KEYS.asteroid : ASSET_KEYS.asteroidGrey);
        const size = Phaser.Math.Between(ASTEROID_SIZE[0], ASTEROID_SIZE[1]);
        this.setDisplaySize(size, size);
        // A bit smaller than the picture, so grazing the bumpy edge doesn't count.
        this.setBodySize(this.width * 0.7, this.height * 0.7);
        this.enableBody(true, x, -size, true, true);
        this.setVelocity(Phaser.Math.Between(-30, 30), Phaser.Math.Between(ASTEROID_SPEED[0], ASTEROID_SPEED[1]));
        this.setAngularVelocity(Phaser.Math.Between(-60, 60));
    }

    update() {
        if (this.y > GAME_HEIGHT + this.displayHeight) {
            this.disableBody(true, true);
        }
    }
}
