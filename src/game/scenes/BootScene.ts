import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import {
    ASSET_KEYS, GAME_WIDTH, GAME_HEIGHT, BULLET_WIDTH, BULLET_HEIGHT, BULLET_COLOR,
    ENEMY_BULLET_COLOR, PART_TYPES, PART_COLORS, PART_SIZE, partTextureKey,
} from '../../config';
import type { PartType } from '../../config';

export class BootScene extends Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.setPath('assets/ships');
        this.load.image(ASSET_KEYS.playerShip, 'shasha_guard.png');
        this.load.image(ASSET_KEYS.enemyGuard, 'zak_guard.png');
        this.load.image(ASSET_KEYS.enemyBot, 'zak_bot_ship.png');
    }

    create() {
        // The tile is a full screen wide and two screens tall, so the
        // repeat period is well off-screen and doesn't read as a grid.
        const tileWidth = GAME_WIDTH;
        const tileHeight = GAME_HEIGHT * 2;

        // Far layer: lots of small, dim dots — a near-static haze.
        this.generateStarTexture(ASSET_KEYS.starsFar, tileWidth, tileHeight, 220, 2, 3, 0x9fb4e0, 0.4, 0.7);
        // Near layer: fewer, slightly bigger, bright dots — but still small dots, not streaks.
        this.generateStarTexture(ASSET_KEYS.starsNear, tileWidth, tileHeight, 55, 2, 3, 0xffffff, 0.85, 1);

        this.generateRectTexture(ASSET_KEYS.bullet, BULLET_WIDTH, BULLET_HEIGHT, BULLET_COLOR);
        this.generateRectTexture(ASSET_KEYS.enemyBullet, BULLET_WIDTH + 2, BULLET_HEIGHT - 4, ENEMY_BULLET_COLOR);
        for (const type of PART_TYPES) {
            this.generatePartTexture(type);
        }
        this.generateShieldIconTexture();

        const emptyInventory = Object.fromEntries(PART_TYPES.map(t => [t, 0])) as Record<PartType, number>;
        this.registry.set('parts', emptyInventory);

        this.scene.start('MenuScene');
    }

    private generateRectTexture(key: string, width: number, height: number, color: number) {
        const g = this.make.graphics({ x: 0, y: 0 }, false);
        g.fillStyle(color, 1);
        g.fillRect(0, 0, width, height);
        g.generateTexture(key, width, height);
        g.destroy();
    }

    // Placeholder HUD shield icon (one per remaining shield hit).
    private generateShieldIconTexture() {
        const w = 28;
        const h = 32;
        const g = this.make.graphics({ x: 0, y: 0 }, false);
        g.fillStyle(0x4fa8ff, 1);
        g.lineStyle(2, 0xffffff, 1);
        g.beginPath();
        g.moveTo(1, 1);
        g.lineTo(w - 1, 1);
        g.lineTo(w - 1, h * 0.55);
        g.lineTo(w / 2, h - 1);
        g.lineTo(1, h * 0.55);
        g.closePath();
        g.fillPath();
        g.strokePath();
        g.generateTexture(ASSET_KEYS.shieldIcon, w, h);
        g.destroy();
    }

    // Placeholder part icons — a different shape and colour per part type,
    // until Sasha draws real ones.
    private generatePartTexture(type: PartType) {
        const s = PART_SIZE;
        const g = this.make.graphics({ x: 0, y: 0 }, false);
        g.fillStyle(PART_COLORS[type], 1);
        g.lineStyle(2, 0xffffff, 1);
        switch (type) {
            case 'engine':
                g.fillCircle(s / 2, s / 2, s / 2 - 1);
                g.strokeCircle(s / 2, s / 2, s / 2 - 1);
                break;
            case 'wing':
                g.fillTriangle(1, s - 1, s - 1, s - 1, s / 2, 1);
                g.strokeTriangle(1, s - 1, s - 1, s - 1, s / 2, 1);
                break;
            case 'cockpit':
                // A diamond, drawn as a top and a bottom triangle.
                g.fillTriangle(1, s / 2, s - 1, s / 2, s / 2, 1);
                g.fillTriangle(1, s / 2, s - 1, s / 2, s / 2, s - 1);
                g.beginPath();
                g.moveTo(s / 2, 1);
                g.lineTo(s - 1, s / 2);
                g.lineTo(s / 2, s - 1);
                g.lineTo(1, s / 2);
                g.closePath();
                g.strokePath();
                break;
            case 'cannon':
                g.fillRect(s / 4, 1, s / 2, s - 2);
                g.strokeRect(s / 4, 1, s / 2, s - 2);
                break;
        }
        g.generateTexture(partTextureKey(type), s, s);
        g.destroy();
    }

    // No star art exists yet, so we draw a tileable field of dots once and
    // reuse it as a TileSprite. Swap for real art in Phase 14.
    private generateStarTexture(
        key: string, width: number, height: number, count: number,
        minSize: number, maxSize: number, color: number, minAlpha: number, maxAlpha: number,
    ) {
        const g = this.make.graphics({ x: 0, y: 0 }, false);
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(minSize, maxSize);
            const alpha = Phaser.Math.FloatBetween(minAlpha, maxAlpha);
            g.fillStyle(color, alpha);
            g.fillRect(x, y, size, size);
        }
        g.generateTexture(key, width, height);
        g.destroy();
    }
}
