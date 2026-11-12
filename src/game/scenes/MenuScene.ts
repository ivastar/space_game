import { Scene } from 'phaser';
import { ASSET_KEYS, GAME_WIDTH, SHIP_DISPLAY_SIZE } from '../../config';
import { makeButton } from '../ui/makeButton';

export class MenuScene extends Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.add.text(GAME_WIDTH / 2, 260, "Sasha's Space Game", {
            fontFamily: 'Arial Black', fontSize: 44, color: '#ffffff',
            align: 'center', wordWrap: { width: GAME_WIDTH - 80 },
        }).setOrigin(0.5);

        const ship = this.add.image(GAME_WIDTH / 2, 500, ASSET_KEYS.playerShip);
        ship.setDisplaySize(SHIP_DISPLAY_SIZE, SHIP_DISPLAY_SIZE * (ship.height / ship.width));

        makeButton(this, GAME_WIDTH / 2, 700, 'Start', () => {
            this.scene.start('GalaxyMapScene');
        });
    }
}
