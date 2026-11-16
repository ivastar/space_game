import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GalaxyMapScene } from './scenes/GalaxyMapScene';
import { LevelScene } from './scenes/LevelScene';
import { StationScene } from './scenes/StationScene';
import { GameOverScene } from './scenes/GameOverScene';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { AUTO, Game, Scale, Types } from 'phaser';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#05050f',
    pixelArt: true,
    // Several fingers at once on the touch console: steer with one, shoot with another.
    input: { activePointers: 4 },
    physics: {
        default: 'arcade',
        arcade: { debug: false },
    },
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        BootScene,
        MenuScene,
        GalaxyMapScene,
        LevelScene,
        StationScene,
        GameOverScene,
    ]
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
