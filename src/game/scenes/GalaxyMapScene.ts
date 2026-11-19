import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, LEVELS, MAP_FLY_DURATION, SHIPS } from '../../config';
import { makeButton } from '../ui/makeButton';
import { getGameState, nextLevelIndex } from '../GameState';
import { audio } from '../GameAudio';
import { addMuteButton } from '../ui/MuteButton';
import { font } from '../style';

export interface Point {
    x: number;
    y: number;
}

// completed: you've flown there. current: the next system to fly to. locked: not yet.
export type SystemState = 'completed' | 'current' | 'locked';

const SHIP_WIDTH = 48;

// The galaxy map: pick the star system to fly to. This part is the same in every style.
// How the galaxy and its star systems are drawn is up to each style's own map
// (ClassicGalaxyMapScene and PencilGalaxyMapScene).
export abstract class GalaxyMapScene extends Scene {
    private ship!: Phaser.GameObjects.Image;
    private flying = false;

    protected abstract readonly shipAboveDot: number; // the ship floats this far above the system it's at
    protected abstract systemPositions(count: number): Point[];
    protected abstract startPoint(positions: Point[]): Point; // where your ship waits before reaching Alpha
    protected abstract drawGalaxy(positions: Point[]): void;
    protected abstract drawRoute(routePoints: Point[], stateOf: (index: number) => SystemState): void;
    protected abstract drawSystem(name: string, p: Point, state: SystemState, levelIndex: number): void;
    protected abstract drawLegend(y: number): void;

    constructor() {
        super('GalaxyMapScene');
    }

    create() {
        this.flying = false;
        audio.playMusic('calm');
        addMuteButton(this, GAME_WIDTH - 85, 40);
        const state = getGameState(this);
        const next = nextLevelIndex(state);
        const positions = this.systemPositions(LEVELS.length);
        const start = this.startPoint(positions);

        this.drawGalaxy(positions);

        const stateOf = (index: number): SystemState => {
            if (state.completed.includes(LEVELS[index].name)) return 'completed';
            return index === next ? 'current' : 'locked';
        };

        this.drawRoute([start, ...positions], stateOf);
        LEVELS.forEach((level, index) => this.drawSystem(level.name, positions[index], stateOf(index), index));

        const locationIndex = LEVELS.findIndex(level => level.name === state.location);
        const here = locationIndex === -1 ? start : positions[locationIndex];
        const ship = SHIPS[state.activeShip];
        this.ship = this.add.image(here.x, here.y - this.shipAboveDot, ship.sprite).setDepth(5).setTint(ship.tint);
        this.ship.setDisplaySize(SHIP_WIDTH, SHIP_WIDTH * (this.ship.height / this.ship.width));
        this.tweens.add({ targets: this.ship, y: this.ship.y - 5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        this.add.text(GAME_WIDTH / 2, 60, 'Galaxy Map', {
            ...font(true), fontSize: 40, color: '#ffffff',
        }).setOrigin(0.5).setDepth(6);
        const hint = next < LEVELS.length
            ? `Next stop: ${LEVELS[next].name}. Tap the glowing star!`
            : 'You reached Omega! Tap any star to fly there again.';
        this.add.text(GAME_WIDTH / 2, 108, hint, {
            ...font(), fontSize: 22, color: '#cccccc',
        }).setOrigin(0.5).setDepth(6);

        this.drawLegend(1110);

        makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 70, 'Back to Menu', () => {
            this.scene.start('MenuScene');
        });
    }

    // Your ship turns towards the system, flies there across the map, and then the level starts.
    protected flyTo(target: Point, levelIndex: number) {
        if (this.flying) return;
        this.flying = true;

        const targetY = target.y - this.shipAboveDot;
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
