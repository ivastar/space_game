import { Scene } from 'phaser';
import { audio } from '../GameAudio';
import { switchStyle, GAME_STYLES, STYLE } from '../style';

const SIZE = 44; // px, the square around the pencil
const DIM = 0.45; // how see-through the button is until you point at it

// A small, quiet square with a pencil in it. Tapping it opens the game again in its
// other style, with the same saved game.
export function addStyleButton(scene: Scene, x: number, y: number) {
    const otherStyle = GAME_STYLES.find(style => style !== STYLE)!;

    const box = scene.add.rectangle(x, y, SIZE, SIZE, 0x1a2233).setStrokeStyle(2, 0x8a8f9b);

    // The pencil, drawn lying flat and then tilted so it points down to the left.
    const pencil = scene.add.graphics({ x, y });
    pencil.fillStyle(0xff8fb1, 1).fillRect(-15, -4, 5, 8); // eraser
    pencil.fillStyle(0xc0c0c8, 1).fillRect(-10, -4, 3, 8); // metal band
    pencil.fillStyle(0xffda28, 1).fillRect(-7, -4, 15, 8); // yellow body
    pencil.fillStyle(0xf0c896, 1).fillTriangle(8, -4, 8, 4, 15, 0); // sharpened wood
    pencil.fillStyle(0x3a3a3e, 1).fillTriangle(12, -1.7, 12, 1.7, 15, 0); // the lead
    pencil.setRotation(Math.PI * 0.75);

    const setDim = (dim: boolean) => {
        box.setAlpha(dim ? DIM : 1);
        pencil.setAlpha(dim ? DIM : 1);
    };
    setDim(true);

    box.setInteractive({ useHandCursor: true });
    box.on('pointerover', () => setDim(false));
    box.on('pointerout', () => setDim(true));
    box.on('pointerdown', () => {
        audio.play('click');
        switchStyle(otherStyle);
    });
}
