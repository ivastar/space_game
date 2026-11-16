import * as Phaser from 'phaser';
import { ASSET_KEYS, GAME_FONT, HUD_NUMBER_COLOR } from '../../config';

// The trip progress bar in the HUD: a pencil-drawn bar that gets coloured in from
// left to right as you fly towards the star system.
export class ProgressBar {
    private fill: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, label: string, left: number, y: number) {
        scene.add.text(left, y - 16, label, {
            fontFamily: GAME_FONT, fontStyle: 'bold', fontSize: 22, color: HUD_NUMBER_COLOR,
            stroke: '#2a2a2e', strokeThickness: 5,
        }).setOrigin(0, 1).setDepth(10);
        scene.add.image(left, y, ASSET_KEYS.progressEmpty).setOrigin(0, 0.5).setDepth(10);
        this.fill = scene.add.image(left, y, ASSET_KEYS.progressFull).setOrigin(0, 0.5).setDepth(10);
        this.show(0);
    }

    // fraction: how much of the trip is done, from 0 to 1.
    show(fraction: number) {
        // Only the left part of the coloured-in bar is shown.
        this.fill.setCrop(0, 0, this.fill.width * Phaser.Math.Clamp(fraction, 0, 1), this.fill.height);
    }
}
