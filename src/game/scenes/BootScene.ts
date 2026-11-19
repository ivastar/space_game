import { Scene } from 'phaser';
import { ASSET_KEYS, BULLET_WIDTH, BULLET_HEIGHT, BULLET_COLOR, ENEMY_BULLET_COLOR, ITEM_SPRITES, GAME_FONT } from '../../config';
import { newGameState } from '../GameState';
import { audio } from '../GameAudio';
import { isPencil } from '../style';
import { generateClassicTextures } from '../ui/classicTextures';

export class BootScene extends Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.setPath('assets/ships');
        this.load.image(ASSET_KEYS.playerShip, 'shasha_guard.png');
        this.load.image(ASSET_KEYS.enemyGuard, 'zak_guard.png');
        this.load.image(ASSET_KEYS.enemyBot, 'zak_bot_ship.png');

        // Everything else in the pencil style: sprites, one PNG file each, named after its key.
        if (isPencil) {
            this.load.setPath('assets/items');
            for (const key of ITEM_SPRITES) {
                this.load.image(key, `${key}.png`);
            }
        }
    }

    create() {
        this.generateRectTexture(ASSET_KEYS.bullet, BULLET_WIDTH, BULLET_HEIGHT, BULLET_COLOR);
        this.generateRectTexture(ASSET_KEYS.enemyBullet, BULLET_WIDTH + 2, BULLET_HEIGHT - 4, ENEMY_BULLET_COLOR);
        if (!isPencil) generateClassicTextures(this);

        audio.init(this.game);
        this.registry.set('gameState', newGameState());

        // Wait for the game's font, otherwise the first screen is written in a plain one.
        const font = GAME_FONT.split(',')[0];
        Promise.all([document.fonts.load(`16px ${font}`), document.fonts.load(`bold 16px ${font}`)])
            .catch(() => undefined) // no font? carry on with the spare ones
            .then(() => this.scene.start('MenuScene'));
    }

    private generateRectTexture(key: string, width: number, height: number, color: number) {
        const g = this.make.graphics({ x: 0, y: 0 }, false);
        g.fillStyle(color, 1);
        g.fillRect(0, 0, width, height);
        g.generateTexture(key, width, height);
        g.destroy();
    }
}
