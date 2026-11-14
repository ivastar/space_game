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
    sonicBlast: 'sonicBlast',
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
// How often enemies come and how many shoot back is set per level — see LEVELS (Phase 9).
export const ENEMY_SPEED = 150; // px/sec, downwards
export const ENEMY_POOL_SIZE = 20;
export const ENEMY_ZIGZAG_CHANCE = 0.4; // 0..1, chance a new enemy zig-zags
export const ENEMY_ZIGZAG_AMPLITUDE = 120; // px left/right from where it started
export const ENEMY_ZIGZAG_PERIOD = 2000; // ms for one full left-right-left swing
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
// Asteroid and storm spawn times are set per level — see LEVELS (Phase 9).

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

// Phase 9: levels
// Each level is a trip to one star system. Trip length is in seconds of normal flying.
// A hyperdrive jump also moves you along the trip: JUMP_DISTANCE_FACTOR of the extra star
// speed counts as distance, so one jump skips roughly 15-20 seconds of the trip.
export const JUMP_DISTANCE_FACTOR = 0.15;
export const ARRIVAL_DELAY = 2500; // ms of "Arriving at..." before the station screen

export interface LevelSettings {
    name: string; // the star system you're flying to
    mapX: number; // where its dot is on the galaxy map
    mapY: number;
    tripLength: number; // seconds of normal flying
    enemySpawnInterval: number; // ms between new bad ships (smaller = more enemies)
    enemyShooterChance: number; // 0..1, chance a new enemy shoots back
    asteroidSpawnTime: [number, number]; // [min, max] ms between asteroids
    stormSpawnTime: [number, number] | null; // [min, max] ms between storms, or null for no storms
}

export const LEVELS: LevelSettings[] = [
    {
        name: 'Alpha',
        mapX: 360, mapY: 860,
        tripLength: 45,
        enemySpawnInterval: 1500,
        enemyShooterChance: 0.15,
        asteroidSpawnTime: [4000, 7000],
        stormSpawnTime: null,
    },
    {
        name: 'Beta',
        mapX: 170, mapY: 660,
        tripLength: 60,
        enemySpawnInterval: 1200,
        enemyShooterChance: 0.25,
        asteroidSpawnTime: [2500, 4500],
        stormSpawnTime: [16000, 24000],
    },
    {
        name: 'Gamma',
        mapX: 550, mapY: 620,
        tripLength: 75,
        enemySpawnInterval: 900,
        enemyShooterChance: 0.35,
        asteroidSpawnTime: [1800, 3200],
        stormSpawnTime: [12000, 18000],
    },
    {
        name: 'Delta',
        mapX: 280, mapY: 430,
        tripLength: 90,
        enemySpawnInterval: 800,
        enemyShooterChance: 0.4,
        asteroidSpawnTime: [1500, 2800],
        stormSpawnTime: [10000, 15000],
    },
    {
        name: 'Epsilon',
        mapX: 460, mapY: 260,
        tripLength: 100,
        enemySpawnInterval: 700,
        enemyShooterChance: 0.5,
        asteroidSpawnTime: [1200, 2400],
        stormSpawnTime: [8000, 13000],
    },
];

// Phase 10: galaxy map
// Where you start. It's a star system on the map, but there's no level to fly there.
export const HOME_SYSTEM = { name: 'Home', mapX: 360, mapY: 1060 };

// Routes between star systems, by name. Finishing a level unlocks every system
// that has a route to it.
export const ROUTES: [string, string][] = [
    ['Home', 'Alpha'],
    ['Alpha', 'Beta'],
    ['Alpha', 'Gamma'],
    ['Beta', 'Delta'],
    ['Gamma', 'Delta'],
    ['Delta', 'Epsilon'],
];

export const MAP_STAR_DRIFT = 0.3; // background stars on the map drift at this fraction of normal speed
export const MAP_FLY_DURATION = 900; // ms for your ship to fly across the map before a level starts

// Phase 11: dark marketplace
export const START_CREDITS = 0;
export const PART_SELL_PRICES: Record<PartType, number> = {
    engine: 12,
    wing: 8,
    cockpit: 15,
    cannon: 10,
};

export const SHOP_ITEMS = ['sonicCannon', 'emShield', 'extraLife', 'speedUpgrade', 'fireRateUpgrade', 'shieldUpgrade'] as const;
export type ShopItem = typeof SHOP_ITEMS[number];
// Upgrades cost this for level 1, twice this for level 2, and so on.
export const SHOP_PRICES: Record<ShopItem, number> = {
    sonicCannon: 250,
    emShield: 80,
    extraLife: 40,
    speedUpgrade: 100,
    fireRateUpgrade: 120,
    shieldUpgrade: 150,
};
export const UPGRADE_MAX_LEVEL = 3; // for the speed and fire rate upgrades
export const SHIELD_UPGRADE_MAX_LEVEL = 2; // each level = +1 shield at the start of every trip
export const SPEED_UPGRADE_STEP = 0.12; // each level makes the ship 12% faster
export const FIRE_RATE_UPGRADE_STEP = 0.15; // each level cuts the time between shots by 15%

// Stations that don't use normal prices. buy and sell multiply the normal prices
// (0.8 = 20% cheaper). Stations not listed here use normal prices.
export const STATION_PRICES: Record<string, { buy: number; sell: number; note: string }> = {
    Beta: { buy: 0.8, sell: 1, note: 'Bargain prices at Beta!' },
    Gamma: { buy: 1, sell: 1.3, note: 'Gamma traders pay extra for parts.' },
    Epsilon: { buy: 1.4, sell: 1.5, note: 'Far from home: everything costs more.' },
};

// The sonic blast cannon (fire with X once you've bought it)
export const SONIC_SPEED = 650; // px/sec, upwards
export const SONIC_FIRE_DELAY = 700; // ms between blasts
export const SONIC_WIDTH = 90; // px on screen
export const SONIC_POOL_SIZE = 6;
