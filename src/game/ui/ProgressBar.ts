import * as Phaser from 'phaser';
import { ASSET_KEYS, GAME_FONT, HUD_NUMBER_COLOR } from '../../config';
import { isPencil } from '../style';

const CLASSIC_WIDTH = 400;
const CLASSIC_HEIGHT = 14;

// The trip progress bar in the HUD: fills up from left to right as you fly towards
// the star system. In the pencil style it's a pencil-drawn bar that gets coloured in.
export class ProgressBar {
    private fill: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, label: string, left: number, y: number) {
        if (isPencil) {
            scene.add.text(left, y - 16, label, {
                fontFamily: GAME_FONT, fontStyle: 'bold', fontSize: 22, color: HUD_NUMBER_COLOR,
                stroke: '#2a2a2e', strokeThickness: 5,
            }).setOrigin(0, 1).setDepth(10);
            scene.add.image(left, y, ASSET_KEYS.progressEmpty).setOrigin(0, 0.5).setDepth(10);
            this.fill = scene.add.image(left, y, ASSET_KEYS.progressFull).setOrigin(0, 0.5).setDepth(10);
        } else {
            scene.add.text(left, y - CLASSIC_HEIGHT / 2 - 4, label, {
                fontFamily: 'Arial', fontSize: 20, color: '#ffffff',
            }).setOrigin(0, 1).setDepth(10);
            scene.add.rectangle(left, y, CLASSIC_WIDTH, CLASSIC_HEIGHT, 0x1a2233)
                .setOrigin(0, 0.5).setStrokeStyle(2, 0xffffff).setDepth(10);
            this.fill = scene.add.rectangle(left, y, CLASSIC_WIDTH, CLASSIC_HEIGHT, 0x4fff8a)
                .setOrigin(0, 0.5).setDepth(10);
        }
        this.show(0);
    }

    // fraction: how much of the trip is done, from 0 to 1.
    show(fraction: number) {
        const done = Phaser.Math.Clamp(fraction, 0, 1);
        if (this.fill instanceof Phaser.GameObjects.Image) {
            // Only the left part of the coloured-in bar is shown.
            this.fill.setCrop(0, 0, this.fill.width * done, this.fill.height);
        } else {
            this.fill.setScale(done, 1);
        }
    }
}
