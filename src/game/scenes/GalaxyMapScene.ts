import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import {
    ASSET_KEYS, GAME_WIDTH, GAME_HEIGHT, GAME_FONT, LEVELS, MAP_FLY_DURATION, GALAXY_STAR_COUNT, GALAXY_STAR_SIZE, SHIPS,
} from '../../config';
import { makeButton } from '../ui/makeButton';
import { getGameState, nextLevelIndex } from '../GameState';
import { audio } from '../GameAudio';
import { addMuteButton } from '../ui/MuteButton';

interface Point {
    x: number;
    y: number;
}

// completed: you've flown there. current: the next system to fly to. locked: not yet.
type SystemState = 'completed' | 'current' | 'locked';

// --- The shape of the spiral galaxy ---
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = 640;
const STRETCH_Y = 1.22; // drawn a bit taller than wide, to fill the tall screen
const OUTER_RADIUS = 320;
const INNER_RADIUS = 45;
const TURNS = 2.2; // how many times an arm winds around the centre
const START_ANGLE = Math.PI * 0.5;

// A point on a spiral arm. t = 0 is the outer edge of the galaxy, t = 1 is the centre.
// The radius shrinks steadily as the arm winds inwards.
function spiralPoint(t: number, armAngle = 0): Point {
    const angle = START_ANGLE + armAngle + t * TURNS * Math.PI * 2;
    const radius = OUTER_RADIUS + (INNER_RADIUS - OUTER_RADIUS) * t;
    return { x: CENTER_X + Math.cos(angle) * radius, y: CENTER_Y + Math.sin(angle) * radius * STRETCH_Y };
}

// Places the 24 star systems along the first arm, evenly spaced along the route:
// Alpha on the outer edge, Omega near the centre.
function systemPositions(count: number): Point[] {
    const steps = 2000;
    const samples: Point[] = [];
    const lengths = [0];
    for (let i = 0; i <= steps; i++) {
        samples.push(spiralPoint(i / steps));
        if (i > 0) {
            const a = samples[i - 1];
            const b = samples[i];
            lengths.push(lengths[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
        }
    }
    const total = lengths[steps];
    const points: Point[] = [];
    let j = 0;
    for (let k = 0; k < count; k++) {
        const target = (total * k) / (count - 1);
        while (j < steps && lengths[j] < target) j++;
        points.push(samples[j]);
    }
    return points;
}

// Each kind of system has its own pencil sprite. radius is about half the sprite's size.
const SYSTEM_STYLE: Record<SystemState, { sprite: string; radius: number; labelColor: string; labelSize: number }> = {
    completed: { sprite: ASSET_KEYS.systemDone, radius: 13, labelColor: '#78c8f5', labelSize: 17 },
    current: { sprite: ASSET_KEYS.systemNext, radius: 20, labelColor: '#ffda28', labelSize: 24 },
    locked: { sprite: ASSET_KEYS.systemLocked, radius: 9, labelColor: '#8a8a90', labelSize: 15 },
};

// School-pencil colours for the galaxy's stars and the route.
const PENCIL = { red: 0xe83030, orange: 0xf58c24, yellow: 0xffda28, blue: 0x2c6ce4, lightBlue: 0x78c8f5, paper: 0xf6f3e8, graphite: 0x3a3a3e };

const SHIP_WIDTH = 48;
const SHIP_ABOVE_DOT = 36; // the ship floats this far above the system it's at

export class GalaxyMapScene extends Scene {
    private ship!: Phaser.GameObjects.Image;
    private flying = false;

    constructor() {
        super('GalaxyMapScene');
    }

    create() {
        this.flying = false;
        audio.playMusic('calm');
        addMuteButton(this, GAME_WIDTH - 85, 40);
        const state = getGameState(this);
        const next = nextLevelIndex(state);
        const positions = systemPositions(LEVELS.length);
        // Your ship waits just outside the galaxy until you've reached Alpha.
        const start = spiralPoint(-0.06);

        this.drawGalaxy();

        const stateOf = (index: number): SystemState => {
            if (state.completed.includes(LEVELS[index].name)) return 'completed';
            return index === next ? 'current' : 'locked';
        };

        // The route: one pencil line from Alpha to Omega. Blue where you've flown,
        // yellow to the next system, thin and grey after that.
        const route = this.add.graphics();
        const routePoints = [start, ...positions];
        for (let i = 1; i < routePoints.length; i++) {
            const s = stateOf(i - 1); // the system at the end of this piece of route
            const from = routePoints[i - 1];
            const to = routePoints[i];
            if (s === 'locked') {
                route.lineStyle(3, 0x8a8a90, 0.6);
                route.lineBetween(from.x, from.y, to.x, to.y);
                continue;
            }
            // A dark pencil outline with the colour on top.
            route.lineStyle(9, PENCIL.graphite, 1);
            route.lineBetween(from.x, from.y, to.x, to.y);
            route.lineStyle(5, s === 'completed' ? PENCIL.lightBlue : PENCIL.yellow, 1);
            route.lineBetween(from.x, from.y, to.x, to.y);
        }

        LEVELS.forEach((level, index) => this.drawSystem(level.name, positions[index], stateOf(index), index));

        const locationIndex = LEVELS.findIndex(level => level.name === state.location);
        const here = locationIndex === -1 ? start : positions[locationIndex];
        const ship = SHIPS[state.activeShip];
        this.ship = this.add.image(here.x, here.y - SHIP_ABOVE_DOT, ship.sprite).setDepth(5).setTint(ship.tint);
        this.ship.setDisplaySize(SHIP_WIDTH, SHIP_WIDTH * (this.ship.height / this.ship.width));
        this.tweens.add({ targets: this.ship, y: this.ship.y - 5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        this.add.text(GAME_WIDTH / 2, 60, 'Galaxy Map', {
            fontFamily: GAME_FONT, fontStyle: 'bold', fontSize: 40, color: '#ffffff',
        }).setOrigin(0.5).setDepth(6);
        const hint = next < LEVELS.length
            ? `Next stop: ${LEVELS[next].name}. Tap the glowing star!`
            : 'You reached Omega! Tap any star to fly there again.';
        this.add.text(GAME_WIDTH / 2, 108, hint, {
            fontFamily: GAME_FONT, fontSize: 22, color: '#cccccc',
        }).setOrigin(0.5).setDepth(6);

        this.drawLegend(1110);

        makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 70, 'Back to Menu', () => {
            this.scene.start('MenuScene');
        });
    }

    // The decorative galaxy, drawn like the sprites: every star is a little pencil-coloured
    // square sitting on a grid, as if it was coloured in on graph paper. There's a warm
    // yellow middle, two spiral arms, and a few stars far away. A fixed seed means it
    // looks the same every time.
    private drawGalaxy() {
        const rng = new Phaser.Math.RandomDataGenerator(['sashas-galaxy']);
        const gaussian = () => {
            // Box-Muller: turns two even random numbers into a bell-curve one.
            const u = Math.max(rng.frac(), 1e-6);
            return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng.frac());
        };
        const g = this.add.graphics().setDepth(-1);
        const size = GALAXY_STAR_SIZE;
        // Colours in one square of the grid. Now and then it's a bigger star, shaped like a plus.
        const star = (x: number, y: number, color: number, alpha: number) => {
            const gx = Math.round(x / size) * size;
            const gy = Math.round(y / size) * size;
            g.fillStyle(color, alpha);
            g.fillRect(gx, gy, size, size);
            if (rng.frac() < 0.05) {
                g.fillRect(gx - size, gy, size * 3, size);
                g.fillRect(gx, gy - size, size, size * 3);
            }
        };

        // Far-away background stars all over the screen.
        for (let i = 0; i < GALAXY_STAR_COUNT * 0.08; i++) {
            star(rng.between(0, GAME_WIDTH), rng.between(0, GAME_HEIGHT), PENCIL.paper, rng.realInRange(0.25, 0.6));
        }

        // Crowded yellow, orange and red stars in the middle.
        for (let i = 0; i < GALAXY_STAR_COUNT * 0.25; i++) {
            const color = rng.pick([PENCIL.yellow, PENCIL.yellow, PENCIL.orange, PENCIL.red, PENCIL.paper]);
            star(CENTER_X + gaussian() * 42, CENTER_Y + gaussian() * 42 * STRETCH_Y, color, rng.realInRange(0.5, 1));
        }

        // The two spiral arms: blue on the outside, turning yellow towards the middle.
        for (let i = 0; i < GALAXY_STAR_COUNT * 0.67; i++) {
            const t = rng.realInRange(-0.05, 1.02);
            const p = spiralPoint(t, i % 2 === 0 ? 0 : Math.PI);
            const spread = 10 + 24 * (1 - t);
            const color = t < 0.6
                ? rng.pick([PENCIL.blue, PENCIL.lightBlue, PENCIL.lightBlue, PENCIL.paper])
                : rng.pick([PENCIL.yellow, PENCIL.orange, PENCIL.paper]);
            star(p.x + gaussian() * spread, p.y + gaussian() * spread, color, rng.realInRange(0.35, 0.9));
        }
    }

    private drawSystem(name: string, p: Point, state: SystemState, levelIndex: number) {
        const style = SYSTEM_STYLE[state];
        const dot = this.add.image(p.x, p.y, style.sprite).setDepth(2);

        // Labels sit just outside the dot, away from the centre, so they don't cover the route.
        const away = Math.atan2((p.y - CENTER_Y) / STRETCH_Y, p.x - CENTER_X);
        const labelDistance = style.radius + 16;
        this.add.text(p.x + Math.cos(away) * labelDistance, p.y + Math.sin(away) * labelDistance, name, {
            fontFamily: GAME_FONT,
            fontStyle: state === 'locked' ? 'normal' : 'bold',
            fontSize: style.labelSize,
            color: style.labelColor,
            stroke: '#1a1a1e',
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(3);

        if (state === 'current') {
            // The next star throbs to say "fly here next".
            this.tweens.add({ targets: dot, scale: 1.3, duration: 550, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }

        // Fly to the next system, or back to one you've finished to play it again.
        // The touch area is a circle a bit bigger than the sprite, for fingers.
        if (state !== 'locked') {
            dot.setInteractive(new Phaser.Geom.Circle(dot.width / 2, dot.height / 2, style.radius + 14), Phaser.Geom.Circle.Contains);
            dot.input!.cursor = 'pointer';
            dot.on('pointerdown', () => this.flyTo(p, levelIndex));
        }
    }

    private drawLegend(y: number) {
        const items: { state: SystemState; text: string }[] = [
            { state: 'completed', text: 'Done' },
            { state: 'current', text: 'Next' },
            { state: 'locked', text: 'Locked' },
        ];
        items.forEach((item, i) => {
            const x = 150 + i * 180;
            const style = SYSTEM_STYLE[item.state];
            this.add.image(x, y, style.sprite).setDepth(6);
            this.add.text(x + 28, y, item.text, {
                fontFamily: GAME_FONT, fontSize: 22, color: '#ffffff',
            }).setOrigin(0, 0.5).setDepth(6);
        });
    }

    // Your ship turns towards the system, flies there across the map, and then the level starts.
    private flyTo(target: Point, levelIndex: number) {
        if (this.flying) return;
        this.flying = true;

        const targetY = target.y - SHIP_ABOVE_DOT;
        this.tweens.killTweensOf(this.ship);
        this.ship.setRotation(Math.atan2(targetY - this.ship.y, target.x - this.ship.x)); // the ship picture faces right
        this.tweens.add({
            targets: this.ship,
            x: target.x,
            y: targetY,
            duration: MAP_FLY_DURATION,
            ease: 'Sine.easeInOut',
            onComplete: () => this.scene.start('LevelScene', { levelIndex }),
        });
    }
}
