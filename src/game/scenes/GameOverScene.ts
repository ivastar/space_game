import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config';
import { makeButton } from '../ui/makeButton';

export class GameOverScene extends Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 44, color: '#ff4444',
        }).setOrigin(0.5);

        makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'Retry', () => {
            this.scene.start('LevelScene');
        });

        makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, 'Menu', () => {
            this.scene.start('MenuScene');
        });
    }
}
