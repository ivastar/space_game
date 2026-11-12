import { Scene } from 'phaser';

// Small placeholder button: a rectangle with a text label, used by every
// scene in Phase 1 to navigate before real UI art exists.
export function makeButton(scene: Scene, x: number, y: number, label: string, onClick: () => void) {
    const width = 280;
    const height = 70;

    const rect = scene.add.rectangle(x, y, width, height, 0x2b6cb0)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true });

    const text = scene.add.text(x, y, label, {
        fontFamily: 'Arial', fontSize: 28, color: '#ffffff',
    }).setOrigin(0.5);

    rect.on('pointerdown', onClick);
    rect.on('pointerover', () => rect.setFillStyle(0x3b82d6));
    rect.on('pointerout', () => rect.setFillStyle(0x2b6cb0));

    return { rect, text };
}
