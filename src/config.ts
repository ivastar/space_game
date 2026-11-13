// All tunable numbers for the game live here.

export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

// Sasha's ship sprites are tiny pixel art (roughly 26x8 to 48x16 px),
// so we scale them up a lot to read on screen. pixelArt stays on in the
// game config so the upscale is crisp instead of blurry.
export const SHIP_DISPLAY_SIZE = 80; // target on-screen width/height in px

export const ASSET_KEYS = {
    playerShip: 'shasha_guard',
    enemyGuard: 'zak_guard',
    enemyBot: 'zak_bot_ship',
    bullet: 'bullet',
    enemyBullet: 'enemyBullet',
    shieldIcon: 'shieldIcon',
    coin: 'coin',
    bolt: 'bolt',
    asteroid: 'asteroid',
    storm: 'storm',
    hyperdriveToken: 'hyperdriveToken',
} as const;

export const partTextureKey = (type: PartType) => `part_${type}`;

// Phase 2: flying the ship
export const PLAYER_SPEED = 320; // px/sec
// Big gap between the two layers' speed/size/brightness so the parallax
// actually reads as two layers of depth, not one twinkly field.
export const STAR_SCROLL_SPEED_FAR = 20; // px/sec, distant parallax layer
export const STAR_SCROLL_SPEED_NEAR = 90; // px/sec, near parallax layer
export const STAR_COUNT_FAR = 110; // small dim stars on screen at once
export const STAR_COUNT_NEAR = 28; // bright stars on screen at once

// Phase 3: shooting
export const BULLET_SPEED = 900; // px/sec, upwards
export const BULLET_FIRE_DELAY = 180; // ms between shots
export const BULLET_POOL_SIZE = 30; // max bullets on screen at once
export const BULLET_WIDTH = 4;
export const BULLET_HEIGHT = 18;
export const BULLET_COLOR = 0xff2222; // red laser

// Phase 4: enemies and parts
export const ENEMY_SPAWN_INTERVAL = 1200; // ms between new bad ships
export const ENEMY_SPEED = 150; // px/sec, downwards
export const ENEMY_POOL_SIZE = 20;
export const ENEMY_ZIGZAG_CHANCE = 0.4; // 0..1, chance a new enemy zig-zags
export const ENEMY_ZIGZAG_AMPLITUDE = 120; // px left/right from where it started
export const ENEMY_ZIGZAG_PERIOD = 2000; // ms for one full left-right-left swing
export const ENEMY_SHOOTER_CHANCE = 0.25; // 0..1, chance a new enemy shoots back
export const ENEMY_FIRE_INTERVAL = 1500; // ms between enemy shots
export const ENEMY_BULLET_SPEED = 400; // px/sec, downwards
export const ENEMY_BULLET_POOL_SIZE = 40;
export const ENEMY_BULLET_COLOR = 0x7cff4f; // green, so it's easy to tell apart from yours

export const PART_TYPES = ['engine', 'wing', 'cockpit', 'cannon'] as const;
export type PartType = typeof PART_TYPES[number];
export const PART_COLORS: Record<PartType, number> = {
    engine: 0xff9a2e,
    wing: 0x6fc3ff,
    cockpit: 0xffe14f,
    cannon: 0xb0b0b0,
};
export const PART_SIZE = 22; // px
export const PARTS_DROP_MIN = 1;
export const PARTS_DROP_MAX = 3;
export const PART_FALL_SPEED = 80; // px/sec
export const PART_POOL_SIZE = 40;

// Phase 5: lives, shield and game over
export const PLAYER_START_SHIELDS = 3; // hits you can take; the next hit after that destroys the ship
export const PLAYER_INVINCIBLE_DURATION = 1500; // ms of flashing after a hit, when you can't be hit again
export const PLAYER_FLASH_INTERVAL = 100; // ms per blink while flashing
export const GAME_OVER_DELAY = 1000; // ms to watch the explosion before the Game Over screen

// Phase 6: space objects
// Spawn times are [min, max] ms; each new one comes a random time in that range after the last.
export const COIN_SPAWN_TIME: [number, number] = [5000, 9000];
export const BOLT_SPAWN_TIME: [number, number] = [9000, 14000];
export const ASTEROID_SPAWN_TIME: [number, number] = [2000, 4000];
export const STORM_SPAWN_TIME: [number, number] = [14000, 22000];

export const PLAYER_MAX_SHIELDS = 5; // coins can't give you more shields than this
export const PICKUP_FALL_SPEED = 120; // px/sec, coins and bolts
export const PICKUP_POOL_SIZE = 10;

export const BOOST_DURATION = 5000; // ms of speed boost from a lightning bolt
export const BOOST_SPEED_MULTIPLIER = 1.7; // ship moves this many times faster while boosted
export const BOOST_TINT = 0xfff3a0; // ship glows yellow while boosted

export const ASTEROID_SPEED: [number, number] = [90, 180]; // px/sec, [min, max]
export const ASTEROID_SIZE: [number, number] = [50, 110]; // px on screen, [min, max]
export const ASTEROID_POOL_SIZE = 12;

export const STORM_SPEED = 60; // px/sec — big and slow
export const STORM_SIZE = 260; // px on screen
export const STORM_POOL_SIZE = 3;

// Phase 7: hyperdrive jump
export const HYPERDRIVE_DROP_CHANCE = 0.2; // 0..1, chance a destroyed bad ship drops a hyperdrive token
export const HYPERDRIVE_START_CHARGES = 0; // jump charges you start each level with
export const JUMP_RAMP_UP = 900; // ms speeding up: starts slow, then faster and faster
export const JUMP_CRUISE = 1200; // ms at full jump speed
export const JUMP_RAMP_DOWN = 1200; // ms slowing back down to normal
export const JUMP_SPEED_MULTIPLIER = 40; // stars move this many times faster at full jump speed
// Streak length = how far a star moves in this many seconds, so faster (near) stars streak longer.
export const JUMP_STREAK_SECONDS = 0.06;
export const JUMP_OBJECTS_FADE = 250; // ms for ships, asteroids, coins etc. to vanish when the jump starts
