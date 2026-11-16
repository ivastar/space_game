import * as Phaser from 'phaser';
import {
    PART_TYPES, START_CREDITS, PLAYER_START_SHIELDS, PLAYER_MAX_SHIELDS, LEVELS, SHIPS, SHIP_TYPES, STARTING_SHIP, SAVE_KEY,
    HYPERDRIVE_START_CHARGES,
} from '../config';
import type { PartType, ShipType } from '../config';

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
    ownedShips: ShipType[]; // ships parked in your garage
    activeShip: ShipType; // the one you fly on your next trip
    jumpCharges: number; // hyperdrive jumps ready to use
    jumpTokens: number; // tokens collected towards the next jump
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
        ownedShips: [STARTING_SHIP],
        activeShip: STARTING_SHIP,
        jumpCharges: HYPERDRIVE_START_CHARGES,
        jumpTokens: 0,
    };
}

export function getGameState(scene: Phaser.Scene): GameState {
    return scene.registry.get('gameState') as GameState;
}

// --- Saving and loading (in the browser's localStorage, so it's still there tomorrow) ---

// Writes the game to the browser. If the browser won't let us (private mode, storage full),
// the game just carries on without saving.
export function saveGame(state: GameState) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
        // can't save, never mind
    }
}

// Reads the saved game, or returns null if there isn't one (or it's broken).
// Anything missing from an older save gets its new-game value, so adding new things
// to GameState later won't break old saves.
export function loadGame(): GameState | null {
    try {
        const text = localStorage.getItem(SAVE_KEY);
        if (!text) return null;
        const saved = JSON.parse(text) as Partial<GameState>;
        const fresh = newGameState();
        const state: GameState = {
            ...fresh,
            ...saved,
            parts: { ...fresh.parts, ...saved.parts },
            upgrades: { ...fresh.upgrades, ...saved.upgrades },
        };
        // Forget ships and systems that aren't in the game any more.
        state.ownedShips = state.ownedShips.filter(ship => SHIP_TYPES.includes(ship));
        if (!state.ownedShips.includes(STARTING_SHIP)) state.ownedShips.unshift(STARTING_SHIP);
        if (!state.ownedShips.includes(state.activeShip)) state.activeShip = STARTING_SHIP;
        state.completed = state.completed.filter(name => LEVELS.some(level => level.name === name));
        if (!LEVELS.some(level => level.name === state.location)) state.location = null;
        if (!(state.currentLevel >= 0 && state.currentLevel < LEVELS.length)) state.currentLevel = 0;
        return state;
    } catch {
        return null;
    }
}

// Levels unlock in order, so the next one to play is the first one you haven't finished.
// Returns LEVELS.length once you've finished them all.
export function nextLevelIndex(state: GameState) {
    const index = LEVELS.findIndex(level => !state.completed.includes(level.name));
    return index === -1 ? LEVELS.length : index;
}

// How many shields you'll start your next trip with: always at least 1, and never more than the maximum.
export function startingShields(state: GameState) {
    const shields = PLAYER_START_SHIELDS + SHIPS[state.activeShip].shields + state.upgrades.shield + state.extraLives;
    return Phaser.Math.Clamp(shields, 1, PLAYER_MAX_SHIELDS);
}
