import * as Phaser from 'phaser';
import {
    GAME_WIDTH, GAME_HEIGHT, STAR_SCROLL_SPEED_FAR, STAR_SCROLL_SPEED_NEAR,
    STAR_COUNT_FAR, STAR_COUNT_NEAR, JUMP_STREAK_SECONDS,
} from '../../config';

interface Star {
    x: number;
    y: number;
    size: number;
    alpha: number;
}

interface StarLayer {
    stars: Star[];
    speed: number; // normal speed, px/sec
    color: number;
}

// The scrolling star background, drawn fresh every frame: a far layer of small,
// dim, slow stars and a near layer of bright, faster ones (that's the parallax).
// During a hyperdrive jump, speedMultiplier goes up and every star stretches into
// a streak — the faster a layer is moving, the longer its streaks.
export class Starfield {
    speedMultiplier = 1;
    private graphics: Phaser.GameObjects.Graphics;
    private layers: StarLayer[];

    constructor(scene: Phaser.Scene) {
        this.graphics = scene.add.graphics().setDepth(-2);
        this.layers = [
            this.makeLayer(STAR_COUNT_FAR, STAR_SCROLL_SPEED_FAR, 0x9fb4e0, 0.4, 0.7),
            this.makeLayer(STAR_COUNT_NEAR, STAR_SCROLL_SPEED_NEAR, 0xffffff, 0.85, 1),
        ];
    }

    private makeLayer(count: number, speed: number, color: number, minAlpha: number, maxAlpha: number): StarLayer {
        const stars: Star[] = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Phaser.Math.Between(0, GAME_WIDTH),
                y: Phaser.Math.Between(0, GAME_HEIGHT),
                size: Phaser.Math.Between(2, 3),
                alpha: Phaser.Math.FloatBetween(minAlpha, maxAlpha),
            });
        }
        return { stars, speed, color };
    }

    update(dt: number) {
        this.graphics.clear();
        for (const layer of this.layers) {
            const speed = layer.speed * this.speedMultiplier;
            // Only the extra speed makes a streak, so at normal speed stars stay round dots.
            const streak = (speed - layer.speed) * JUMP_STREAK_SECONDS;
            for (const star of layer.stars) {
                star.y += speed * dt;
                // Once the whole streak is below the screen, send the star back to the top.
                if (star.y - streak > GAME_HEIGHT) {
                    star.y -= GAME_HEIGHT + streak;
                    star.x = Phaser.Math.Between(0, GAME_WIDTH);
                }
                this.graphics.fillStyle(layer.color, star.alpha);
                this.graphics.fillRect(star.x, star.y - streak, star.size, star.size + streak);
            }
        }
    }
}
