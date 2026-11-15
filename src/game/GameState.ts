import type * as Phaser from 'phaser';
import { PART_TYPES, START_CREDITS, PLAYER_START_SHIELDS, PLAYER_MAX_SHIELDS, LEVELS } from '../config';
import type { PartType } from '../config';

export type UpgradeKind = 'speed' | 'fireRate' | 'shield';

// Everything the player owns and has done, in one object. It lives in Phaser's
// registry so every scene can read and change it.
export interface GameState {
    credits: number;
    parts: Record<PartType, number>;
    completed: string[]; // names of star systems you've reached
    location: string | null; // the star system your ship is at on the galaxy map (null = not reached one yet)
    currentLevel: number; // index into LEVELS of the trip you're on (or just finished)
    hasSonicCannon: boolean;
    emShields: number;
    extraLives: number; // bought at the marketplace; added to your shields on your next trip
    upgrades: Record<UpgradeKind, number>; // level of each upgrade, 0 = not bought
}

export function newGameState(): GameState {
    return {
        credits: START_CREDITS,
        parts: Object.fromEntries(PART_TYPES.map(t => [t, 0])) as Record<PartType, number>,
        completed: [],
        location: null,
        currentLevel: 0,
        hasSonicCannon: false,
        emShields: 0,
        extraLives: 0,
        upgrades: { speed: 0, fireRate: 0, shield: 0 },
    };
}

export function getGameState(scene: Phaser.Scene): GameState {
    return scene.registry.get('gameState') as GameState;
}

// Levels unlock in order, so the next one to play is the first one you haven't finished.
// Returns LEVELS.length once you've finished them all.
export function nextLevelIndex(state: GameState) {
    const index = LEVELS.findIndex(level => !state.completed.includes(level.name));
    return index === -1 ? LEVELS.length : index;
}

// How many shields you'll start your next trip with.
export function startingShields(state: GameState) {
    return Math.min(PLAYER_MAX_SHIELDS, PLAYER_START_SHIELDS + state.upgrades.shield + state.extraLives);
}
