import * as Phaser from 'phaser';

// The trip progress bar in the HUD: fills up from left to right as you fly
// towards the star system.
export class ProgressBar {
    private fill: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, label: string, left: number, y: number, width: number, height = 14) {
        scene.add.text(left, y - height / 2 - 4, label, {
            fontFamily: 'Arial', fontSize: 20, color: '#ffffff',
        }).setOrigin(0, 1).setDepth(10);
        scene.add.rectangle(left, y, width, height, 0x1a2233)
            .setOrigin(0, 0.5).setStrokeStyle(2, 0xffffff).setDepth(10);
        this.fill = scene.add.rectangle(left, y, width, height, 0x4fff8a)
            .setOrigin(0, 0.5).setDepth(10);
        this.show(0);
    }

    // fraction: how much of the trip is done, from 0 to 1.
    show(fraction: number) {
        this.fill.setScale(Phaser.Math.Clamp(fraction, 0, 1), 1);
    }
}
