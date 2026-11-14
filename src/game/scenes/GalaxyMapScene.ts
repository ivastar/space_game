import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import {
    ASSET_KEYS, GAME_WIDTH, GAME_HEIGHT, LEVELS, HOME_SYSTEM, ROUTES,
    MAP_STAR_DRIFT, MAP_FLY_DURATION,
} from '../../config';
import { makeButton } from '../ui/makeButton';
import { Starfield } from '../objects/Starfield';
import { getGameState } from '../GameState';

interface MapSystem {
    name: string;
    x: number;
    y: number;
    levelIndex: number | null; // null for Home, which has no level
}

// home: where you started. completed: you've flown there. reachable: a route leads
// there from somewhere you've been, so you can fly there. locked: not yet.
type SystemState = 'home' | 'completed' | 'reachable' | 'locked';

const DOT_COLORS: Record<SystemState, number> = {
    home: 0x6fc3ff,
    completed: 0x4fff8a,
    reachable: 0xffcc00,
    locked: 0x555c6e,
};

const SHIP_WIDTH = 56;
const SHIP_ABOVE_DOT = 42; // the ship floats this far above the dot of the system it's at

export class GalaxyMapScene extends Scene {
    private starfield!: Starfield;
    private ship!: Phaser.GameObjects.Image;
    private flying = false;

    constructor() {
        super('GalaxyMapScene');
    }

    create() {
        this.flying = false;
        this.starfield = new Starfield(this);
        this.starfield.speedMultiplier = MAP_STAR_DRIFT;

        this.add.text(GAME_WIDTH / 2, 110, 'Galaxy Map', {
            fontFamily: 'Arial Black', fontSize: 40, color: '#ffffff',
        }).setOrigin(0.5);

        const systems: MapSystem[] = [
            { name: HOME_SYSTEM.name, x: HOME_SYSTEM.mapX, y: HOME_SYSTEM.mapY, levelIndex: null },
            ...LEVELS.map((level, levelIndex) => ({ name: level.name, x: level.mapX, y: level.mapY, levelIndex })),
        ];
        const byName = new Map(systems.map(s => [s.name, s]));
        const state = getGameState(this);
        const completed = new Set(state.completed);
        const visited = new Set([HOME_SYSTEM.name, ...completed]);

        const stateOf = (system: MapSystem): SystemState => {
            if (system.levelIndex === null) return 'home';
            if (completed.has(system.name)) return 'completed';
            const routeFromVisited = ROUTES.some(([a, b]) =>
                (a === system.name && visited.has(b)) || (b === system.name && visited.has(a)));
            return routeFromVisited ? 'reachable' : 'locked';
        };

        // Routes you've opened up are bright; the rest are faint.
        const routes = this.add.graphics();
        for (const [a, b] of ROUTES) {
            const from = byName.get(a)!;
            const to = byName.get(b)!;
            const open = visited.has(a) || visited.has(b);
            routes.lineStyle(open ? 4 : 2, open ? 0x8fb8ff : 0x3a4766, open ? 0.9 : 0.6);
            routes.lineBetween(from.x, from.y, to.x, to.y);
        }

        for (const system of systems) {
            this.drawSystem(system, stateOf(system));
        }

        const here = byName.get(state.location) ?? byName.get(HOME_SYSTEM.name)!;
        this.ship = this.add.image(here.x, here.y - SHIP_ABOVE_DOT, ASSET_KEYS.playerShip).setDepth(5);
        this.ship.setDisplaySize(SHIP_WIDTH, SHIP_WIDTH * (this.ship.height / this.ship.width));
        this.tweens.add({ targets: this.ship, y: this.ship.y - 6, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 175, 'Tap a glowing star to fly there', {
            fontFamily: 'Arial', fontSize: 24, color: '#cccccc',
        }).setOrigin(0.5);

        makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 100, 'Back to Menu', () => {
            this.scene.start('MenuScene');
        });
    }

    update(_time: number, delta: number) {
        this.starfield.update(delta / 1000);
    }

    private drawSystem(system: MapSystem, state: SystemState) {
        const { x, y } = system;
        const dot = this.add.circle(x, y, 20, DOT_COLORS[state]).setDepth(2);

        const label = state === 'completed' ? `${system.name} ✓` : system.name;
        this.add.text(x, y + 38, label, {
            fontFamily: 'Arial', fontSize: 24, color: state === 'locked' ? '#777e8f' : '#ffffff',
        }).setOrigin(0.5).setDepth(2);

        if (state === 'reachable') {
            // A pulsing glow ring says "you can go here".
            const glow = this.add.circle(x, y, 20).setStrokeStyle(3, DOT_COLORS.reachable).setDepth(1);
            this.tweens.add({ targets: glow, scale: 1.8, alpha: 0, duration: 1100, repeat: -1 });
        }

        // You can fly to new systems, and back to ones you've finished to play them again.
        if ((state === 'reachable' || state === 'completed') && system.levelIndex !== null) {
            const levelIndex = system.levelIndex;
            dot.setInteractive({ useHandCursor: true });
            dot.on('pointerdown', () => this.flyTo(system.x, system.y, levelIndex));
        }
    }

    // Your ship turns towards the system, flies there across the map, and then the level starts.
    private flyTo(x: number, y: number, levelIndex: number) {
        if (this.flying) return;
        this.flying = true;

        const targetY = y - SHIP_ABOVE_DOT;
        this.tweens.killTweensOf(this.ship);
        this.ship.setRotation(Math.atan2(targetY - this.ship.y, x - this.ship.x)); // the ship picture faces right
        this.tweens.add({
            targets: this.ship,
            x,
            y: targetY,
            duration: MAP_FLY_DURATION,
            ease: 'Sine.easeInOut',
            onComplete: () => this.scene.start('LevelScene', { levelIndex }),
        });
    }
}
