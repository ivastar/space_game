import * as Phaser from 'phaser';
import { GAME_HEIGHT, PART_FALL_SPEED, partTextureKey } from '../../config';
import type { PartType } from '../../config';

// A ship part dropped by a destroyed bad ship. Fly over it to collect it.
export class Part extends Phaser.Physics.Arcade.Image {
    partType: PartType = 'engine';

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, partTextureKey('engine'));
    }

    drop(x: number, y: number, type: PartType) {
        this.partType = type;
        this.setTexture(partTextureKey(type));
        this.enableBody(true, x, y, true, true);
        // Pop out sideways a little, then slow down and drift downwards.
        this.setVelocity(Phaser.Math.Between(-90, 90), PART_FALL_SPEED);
        this.setDragX(120);
    }

    update() {
        if (this.y > GAME_HEIGHT + this.height) {
            this.disableBody(true, true);
        }
    }
}
