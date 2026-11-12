import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config';
import { makeButton } from '../ui/makeButton';

// Placeholder galaxy map: a few star systems as dots. Real routes and
// unlock logic come in Phase 10 — for now, any dot is clickable.
const SYSTEMS = [
    { name: 'Alpha', x: GAME_WIDTH / 2, y: 300 },
    { name: 'Beta', x: GAME_WIDTH / 2 - 150, y: 550 },
    { name: 'Gamma', x: GAME_WIDTH / 2 + 150, y: 800 },
];

export class GalaxyMapScene extends Scene {
    constructor() {
        super('GalaxyMapScene');
    }

    create() {
        this.add.text(GAME_WIDTH / 2, 120, 'Galaxy Map', {
            fontFamily: 'Arial Black', fontSize: 40, color: '#ffffff',
        }).setOrigin(0.5);

        for (const system of SYSTEMS) {
            const dot = this.add.circle(system.x, system.y, 24, 0xffcc00)
                .setInteractive({ useHandCursor: true });
            this.add.text(system.x, system.y - 50, system.name, {
                fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            }).setOrigin(0.5);

            dot.on('pointerdown', () => this.scene.start('LevelScene'));
        }

        makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 100, 'Back to Menu', () => {
            this.scene.start('MenuScene');
        });
    }
}
