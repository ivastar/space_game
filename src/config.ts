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
    starsFar: 'starsFar',
    starsNear: 'starsNear',
    bullet: 'bullet',
    enemyBullet: 'enemyBullet',
    shieldIcon: 'shieldIcon',
} as const;

export const partTextureKey = (type: PartType) => `part_${type}`;

// Phase 2: flying the ship
export const PLAYER_SPEED = 320; // px/sec
// Big gap between the two layers' speed/size/brightness so the parallax
// actually reads as two layers of depth, not one twinkly field.
export const STAR_SCROLL_SPEED_FAR = 20; // px/sec, distant parallax layer
export const STAR_SCROLL_SPEED_NEAR = 90; // px/sec, near parallax layer

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
