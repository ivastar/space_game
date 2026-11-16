import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GAME_FONT } from '../../config';
import { makeButton } from '../ui/makeButton';
import { getGameState, saveGame } from '../GameState';
import { audio } from '../GameAudio';

export class GameOverScene extends Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        // You keep the parts you picked up before you were hit, so save them.
        saveGame(getGameState(this));
        audio.playMusic('calm');

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Game Over', {
            fontFamily: GAME_FONT, fontStyle: 'bold', fontSize: 44, color: '#ff4444',
        }).setOrigin(0.5);

        makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'Retry', () => {
            this.scene.start('LevelScene');
        });

        makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, 'Menu', () => {
            this.scene.start('MenuScene');
        });
    }
}
