import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GALAXY_STAR_COUNT } from '../../config';
import { GalaxyMapScene } from './GalaxyMapScene';
import type { Point, SystemState } from './GalaxyMapScene';
import { CENTER_X, CENTER_Y, STRETCH_Y, OUTER_RADIUS, spiralPoint, systemPositions } from './spiralGalaxy';

const SYSTEM_STYLE: Record<SystemState, { color: number; radius: number; labelColor: string; labelSize: number }> = {
    completed: { color: 0x4fff8a, radius: 9, labelColor: '#c8ffd9', labelSize: 16 },
    current: { color: 0xffcc00, radius: 12, labelColor: '#ffe14f', labelSize: 22 },
    locked: { color: 0x555c6e, radius: 6, labelColor: '#6b7286', labelSize: 15 },
};

// The galaxy map in the classic style: the journey winds along an arm of a spiral
// galaxy, from the outer edge to the centre.
export class ClassicGalaxyMapScene extends GalaxyMapScene {
    protected readonly shipAboveDot = 30;

    protected systemPositions(count: number) {
        return systemPositions(count);
    }

    // Your ship waits just outside the galaxy until you've reached Alpha.
    protected startPoint() {
        return spiralPoint(-0.06);
    }

    // The route: one line from Alpha to Omega. Bright where you've flown,
    // yellow to the next system, faint after that.
    protected drawRoute(routePoints: Point[], stateOf: (index: number) => SystemState) {
        const route = this.add.graphics();
        for (let i = 1; i < routePoints.length; i++) {
            const s = stateOf(i - 1); // the system at the end of this piece of route
            if (s === 'completed') route.lineStyle(4, 0x8fd8ff, 0.95);
            else if (s === 'current') route.lineStyle(3, 0xffcc00, 0.8);
            else route.lineStyle(2, 0x6b7286, 0.45);
            route.lineBetween(routePoints[i - 1].x, routePoints[i - 1].y, routePoints[i].x, routePoints[i].y);
        }
    }

    // The decorative galaxy: a glowing core, two spiral arms full of stars, some
    // coloured gas clouds, and a few stars far away. A fixed seed means it looks
    // the same every time.
    protected drawGalaxy() {
        const rng = new Phaser.Math.RandomDataGenerator(['sashas-galaxy']);
        const gaussian = () => {
            // Box-Muller: turns two even random numbers into a bell-curve one.
            const u = Math.max(rng.frac(), 1e-6);
            return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng.frac());
        };
        const g = this.add.graphics().setDepth(-1);

        // Far-away background stars all over the screen.
        for (let i = 0; i < GALAXY_STAR_COUNT * 0.06; i++) {
            g.fillStyle(0xffffff, rng.realInRange(0.15, 0.5));
            g.fillRect(rng.between(0, GAME_WIDTH), rng.between(0, GAME_HEIGHT), 2, 2);
        }

        // Coloured gas clouds along the arms.
        for (let i = 0; i < 16; i++) {
            const p = spiralPoint(rng.realInRange(0, 0.9), rng.pick([0, Math.PI]));
            g.fillStyle(rng.pick([0xb06cff, 0x6c8cff, 0xff6cb5]), rng.realInRange(0.04, 0.08));
            g.fillCircle(p.x + gaussian() * 20, p.y + gaussian() * 20, rng.between(40, 90));
        }

        // The glowing core.
        for (let r = 110; r > 0; r -= 10) {
            g.fillStyle(0xffd9a0, 0.05);
            g.fillEllipse(CENTER_X, CENTER_Y, r * 2, r * 2 * STRETCH_Y);
        }

        // A soft haze of stars across the whole disc.
        for (let i = 0; i < GALAXY_STAR_COUNT * 0.12; i++) {
            const angle = rng.frac() * Math.PI * 2;
            const radius = Math.sqrt(rng.frac()) * OUTER_RADIUS * 1.1;
            g.fillStyle(0xc8d8ff, rng.realInRange(0.15, 0.4));
            g.fillRect(CENTER_X + Math.cos(angle) * radius, CENTER_Y + Math.sin(angle) * radius * STRETCH_Y, 1.5, 1.5);
        }

        // Crowded, warm-coloured stars in the middle.
        for (let i = 0; i < GALAXY_STAR_COUNT * 0.2; i++) {
            g.fillStyle(rng.pick([0xffe9c4, 0xfff4e0, 0xffd08a]), rng.realInRange(0.4, 0.95));
            g.fillRect(CENTER_X + gaussian() * 45, CENTER_Y + gaussian() * 45 * STRETCH_Y, rng.realInRange(1, 2.5), rng.realInRange(1, 2.5));
        }

        // The two spiral arms: most of the stars. Arms get wider and bluer towards the edge.
        for (let i = 0; i < GALAXY_STAR_COUNT * 0.62; i++) {
            const t = rng.realInRange(-0.05, 1.02);
            const p = spiralPoint(t, i % 2 === 0 ? 0 : Math.PI);
            const spread = 10 + 26 * (1 - t);
            g.fillStyle(t < 0.6 ? rng.pick([0xa8c8ff, 0xffffff, 0xd0e0ff]) : rng.pick([0xffffff, 0xfff0d8]), rng.realInRange(0.3, 0.95));
            const size = rng.frac() < 0.08 ? 3 : rng.realInRange(1, 2.2);
            g.fillRect(p.x + gaussian() * spread, p.y + gaussian() * spread, size, size);
        }
    }

    protected drawSystem(name: string, p: Point, state: SystemState, levelIndex: number) {
        const style = SYSTEM_STYLE[state];
        const dot = this.add.circle(p.x, p.y, style.radius, style.color).setDepth(2);
        if (state !== 'locked') dot.setStrokeStyle(2, 0xffffff);

        // Labels sit just outside the dot, away from the centre, so they don't cover the route.
        const away = Math.atan2((p.y - CENTER_Y) / STRETCH_Y, p.x - CENTER_X);
        const labelDistance = style.radius + 16;
        const label = state === 'completed' ? `${name} ✓` : name;
        this.add.text(p.x + Math.cos(away) * labelDistance, p.y + Math.sin(away) * labelDistance, label, {
            fontFamily: state === 'current' ? 'Arial Black' : 'Arial',
            fontSize: style.labelSize,
            color: style.labelColor,
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(3);

        if (state === 'current') {
            // A pulsing ring says "fly here next".
            const glow = this.add.circle(p.x, p.y, style.radius).setStrokeStyle(3, style.color).setDepth(1);
            this.tweens.add({ targets: glow, scale: 2.4, alpha: 0, duration: 1100, repeat: -1 });
        }

        // Fly to the next system, or back to one you've finished to play it again.
        if (state !== 'locked') {
            dot.setInteractive(new Phaser.Geom.Circle(style.radius, style.radius, style.radius + 12), Phaser.Geom.Circle.Contains);
            dot.input!.cursor = 'pointer';
            dot.on('pointerdown', () => this.flyTo(p, levelIndex));
        }
    }

    protected drawLegend(y: number) {
        const items: { state: SystemState; text: string }[] = [
            { state: 'completed', text: 'Done' },
            { state: 'current', text: 'Next' },
            { state: 'locked', text: 'Locked' },
        ];
        items.forEach((item, i) => {
            const x = 150 + i * 180;
            const style = SYSTEM_STYLE[item.state];
            this.add.circle(x, y, style.radius, style.color).setDepth(6);
            this.add.text(x + 20, y, item.text, {
                fontFamily: 'Arial', fontSize: 22, color: '#ffffff',
            }).setOrigin(0, 0.5).setDepth(6);
        });
    }
}
