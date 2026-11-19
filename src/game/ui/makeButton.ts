import { Scene } from 'phaser';
import { audio } from '../GameAudio';
import { font } from '../style';

export interface ButtonOptions {
    width?: number;
    height?: number;
    fontSize?: number;
    enabled?: boolean; // a disabled button is grey and can't be pressed
    color?: number;
}

// A simple button: a rectangle with a text label.
export function makeButton(scene: Scene, x: number, y: number, label: string, onClick: () => void, options: ButtonOptions = {}) {
    const { width = 280, height = 70, fontSize = 28, enabled = true, color = 0x2b6cb0 } = options;
    const fill = enabled ? color : 0x3a3f4b;
    const hoverFill = 0x3b82d6;

    const rect = scene.add.rectangle(x, y, width, height, fill)
        .setStrokeStyle(2, enabled ? 0xffffff : 0x6a6f7b);

    const text = scene.add.text(x, y, label, {
        ...font(), fontSize, color: enabled ? '#ffffff' : '#8a8f9b',
    }).setOrigin(0.5);

    if (enabled) {
        rect.setInteractive({ useHandCursor: true });
        rect.on('pointerdown', () => {
            audio.play('click');
            onClick();
        });
        rect.on('pointerover', () => rect.setFillStyle(hoverFill));
        rect.on('pointerout', () => rect.setFillStyle(fill));
    }

    return { rect, text };
}
