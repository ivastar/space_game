import * as Phaser from 'phaser';
import { ASSET_KEYS, GAME_HEIGHT, PICKUP_FALL_SPEED } from '../../config';

export type PickupKind = 'coin' | 'bolt';

// Something good floating down from the top: a coin (+1 shield) or a
// lightning bolt (speed boost). Fly over it to collect it.
export class Pickup extends Phaser.Physics.Arcade.Image {
    kind: PickupKind = 'coin';

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, ASSET_KEYS.coin);
    }

    spawn(x: number, kind: PickupKind) {
        this.kind = kind;
        this.setTexture(kind === 'coin' ? ASSET_KEYS.coin : ASSET_KEYS.bolt);
        this.setBodySize(this.width, this.height);
        this.enableBody(true, x, -this.height, true, true);
        this.setVelocity(0, PICKUP_FALL_SPEED);
    }

    update() {
        if (this.y > GAME_HEIGHT + this.height) {
            this.disableBody(true, true);
        }
    }
}
