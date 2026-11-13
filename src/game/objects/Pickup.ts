import * as Phaser from 'phaser';
import { ASSET_KEYS, GAME_HEIGHT, PICKUP_FALL_SPEED } from '../../config';

export type PickupKind = 'coin' | 'bolt' | 'hyperdrive';

const TEXTURES: Record<PickupKind, string> = {
    coin: ASSET_KEYS.coin,
    bolt: ASSET_KEYS.bolt,
    hyperdrive: ASSET_KEYS.hyperdriveToken,
};

// Something good floating down: a coin (+1 shield), a lightning bolt (speed boost)
// or a hyperdrive token (+1 jump charge). Fly over it to collect it.
export class Pickup extends Phaser.Physics.Arcade.Image {
    kind: PickupKind = 'coin';

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, ASSET_KEYS.coin);
    }

    // Starts just above the top of the screen, unless a y is given (e.g. where an enemy blew up).
    spawn(x: number, kind: PickupKind, y?: number) {
        this.kind = kind;
        this.setTexture(TEXTURES[kind]);
        this.setBodySize(this.width, this.height);
        this.enableBody(true, x, y ?? -this.height, true, true);
        this.setVelocity(0, PICKUP_FALL_SPEED);
    }

    update() {
        if (this.y > GAME_HEIGHT + this.height) {
            this.disableBody(true, true);
        }
    }
}
