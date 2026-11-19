import { Scene } from 'phaser';
import { ASSET_KEYS, GAME_WIDTH, GAME_HEIGHT, LEVELS, SHIP_DISPLAY_SIZE } from '../../config';
import { makeButton } from '../ui/makeButton';
import { loadGame, newGameState } from '../GameState';
import type { GameState } from '../GameState';
import { audio } from '../GameAudio';
import { addMuteButton } from '../ui/MuteButton';
import { addStyleButton } from '../ui/StyleButton';
import { font } from '../style';

export class MenuScene extends Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        audio.playMusic('calm');
        addMuteButton(this, GAME_WIDTH - 85, 40);

        this.add.text(GAME_WIDTH / 2, 260, "Sasha's Space Game", {
            ...font(true), fontSize: 44, color: '#ffffff',
            align: 'center', wordWrap: { width: GAME_WIDTH - 80 },
        }).setOrigin(0.5);

        const ship = this.add.image(GAME_WIDTH / 2, 500, ASSET_KEYS.playerShip);
        ship.setDisplaySize(SHIP_DISPLAY_SIZE, SHIP_DISPLAY_SIZE * (ship.height / ship.width));

        // The pencil in the bottom-left corner switches to the game's other style.
        addStyleButton(this, 40, GAME_HEIGHT - 40);

        const saved = loadGame();
        if (!saved) {
            makeButton(this, GAME_WIDTH / 2, 700, 'Start', () => this.play(newGameState()));
            return;
        }

        makeButton(this, GAME_WIDTH / 2, 700, 'Continue', () => this.play(saved));
        this.add.text(GAME_WIDTH / 2, 760, `${saved.completed.length} of ${LEVELS.length} systems reached, ${saved.credits} credits`, {
            ...font(), fontSize: 20, color: '#aab3c5',
        }).setOrigin(0.5);

        // New Game throws away the saved game, so it asks you to tap twice to be sure.
        let sure = false;
        const { text } = makeButton(this, GAME_WIDTH / 2, 850, 'New Game', () => {
            if (sure) {
                this.play(newGameState());
            } else {
                sure = true;
                text.setText('Tap again to start over').setFontSize(22);
            }
        });
    }

    private play(state: GameState) {
        this.registry.set('gameState', state);
        this.scene.start('GalaxyMapScene');
    }
}
