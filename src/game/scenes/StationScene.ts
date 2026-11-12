import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config';
import { makeButton } from '../ui/makeButton';

// Placeholder station screen. Marketplace (Phase 11) and garage (Phase 12)
// tabs arrive later — for now it's just a waypoint back to the map.
export class StationScene extends Scene {
    constructor() {
        super('StationScene');
    }

    create() {
        this.add.text(GAME_WIDTH / 2, 160, 'Station', {
            fontFamily: 'Arial Black', fontSize: 40, color: '#ffffff',
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 230, 'Marketplace & Garage', {
            fontFamily: 'Arial', fontSize: 24, color: '#cccccc',
        }).setOrigin(0.5);

        makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Back to Galaxy Map', () => {
            this.scene.start('GalaxyMapScene');
        });
    }
}
