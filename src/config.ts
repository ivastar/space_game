// All tunable numbers for the game live here.

export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

// Sasha's ship sprites are tiny pixel art (roughly 26x8 to 48x16 px),
// so we scale them up a lot to read on screen. pixelArt stays on in the
// game config so the upscale is crisp instead of blurry.
export const SHIP_DISPLAY_SIZE = 80; // target on-screen width/height in px

// Each sprite's key is also its file name: 'coin' is assets/items/coin.png.
export const ASSET_KEYS = {
    playerShip: 'shasha_guard',
    enemyGuard: 'zak_guard',
    enemyBot: 'zak_bot_ship',
    bullet: 'bullet',
    enemyBullet: 'enemyBullet',
    coin: 'coin',
    bolt: 'bolt',
    asteroid: 'asteroid',
    asteroidGrey: 'asteroid_grey',
    storm: 'storm',
    hyperdriveToken: 'hyperdrive_token',
    sonicBlast: 'sonic_blast',
    explosion: 'explosion',
    lifeEmpty: 'life_empty',
    systemDone: 'system_done',
    systemNext: 'system_next',
    systemLocked: 'system_locked',
    progressEmpty: 'progress_empty',
    progressFull: 'progress_full',
} as const;

export const partTextureKey = (type: PartType) => `part_${type}`;
// The squares of the lives bar: life_1 is red, life_5 is green.
export const LIFE_COLOR_COUNT = 5;
export const lifeTextureKey = (n: number) => `life_${Math.min(n, LIFE_COLOR_COUNT)}`;

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
export const HYPERDRIVE_DROP_CHANCE = 0.3; // 0..1, chance a destroyed bad ship drops a hyperdrive token
export const HYPERDRIVE_TOKENS_PER_JUMP = 3; // collect this many tokens to earn one jump
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

// The things that can appear in a level. Each level brings in at most one new thing:
// NEW_THING_ORDER[0] is new in level 1 (Alpha), NEW_THING_ORDER[1] in level 2 (Beta),
// and so on. Once something has been introduced it keeps appearing in every later level.
export const NEW_THING_ORDER = [
    'basicShips', // Alpha
    'asteroids', // Beta
    'coins', // Gamma
    'lightning', // Delta
    'zigzagShips', // Epsilon
    'hyperdriveTokens', // Zeta
    'storms', // Eta
    'shooterShips', // Theta
    'botShips', // Iota — from Kappa on, nothing new: levels just get harder
] as const;
export type NewThing = typeof NEW_THING_ORDER[number];

// Has this thing been introduced by this level (counting from 0 = Alpha)?
export const isIntroduced = (thing: NewThing, levelIndex: number) => NEW_THING_ORDER.indexOf(thing) <= levelIndex;

// The banner shown at the start of the level where something is new.
export const NEW_THING_NAMES: Record<NewThing, string> = {
    basicShips: 'Bad ships! Shoot them with Space.',
    asteroids: 'Asteroids! Your lasers bounce off — dodge them.',
    coins: 'Coins! Grab them for an extra shield.',
    lightning: 'Lightning bolts! They make you fast for a while.',
    zigzagShips: 'Zig-zag ships! Harder to hit.',
    hyperdriveTokens: 'Hyperdrive tokens! Collect 3 to earn a jump (Shift).',
    storms: 'EM storms! Touching one is deadly.',
    shooterShips: 'Watch out: these ships shoot back!',
    botShips: 'Bot ships! They take two hits.',
};
export const NEW_THING_BANNER_TIME = 3500; // ms the "new thing" banner stays up

export const BOT_SHIP_CHANCE = 0.3; // 0..1, chance a new enemy is a bot ship (once bot ships are introduced)
export const BOT_SHIP_HEALTH = 2; // laser hits a bot ship can take

export interface LevelSettings {
    name: string; // the star system you're flying to
    tripLength: number; // seconds of normal flying
    enemySpawnInterval: number; // ms between new bad ships (smaller = more enemies)
    enemyShooterChance: number; // 0..1, chance a new enemy shoots back (once shooter ships are introduced)
    asteroidSpawnTime: [number, number]; // [min, max] ms between asteroids (once introduced)
    stormSpawnTime: [number, number]; // [min, max] ms between storms (once introduced)
}

// 24 levels, one for each letter of the Greek alphabet. They unlock in order:
// finishing a level opens the next one. Each gets a bit longer and busier than the last.
export const LEVELS: LevelSettings[] = [
    { name: 'Alpha',    tripLength:  25, enemySpawnInterval: 3000, enemyShooterChance: 0,    asteroidSpawnTime: [6000, 10800], stormSpawnTime: [22000, 33000] },
    { name: 'Beta',     tripLength:  27, enemySpawnInterval: 2850, enemyShooterChance: 0,    asteroidSpawnTime: [5700, 10300], stormSpawnTime: [21500, 32000] },
    { name: 'Gamma',    tripLength:  29, enemySpawnInterval: 2700, enemyShooterChance: 0,    asteroidSpawnTime: [5500,  9900], stormSpawnTime: [20500, 31000] },
    { name: 'Delta',    tripLength:  32, enemySpawnInterval: 2600, enemyShooterChance: 0,    asteroidSpawnTime: [5200,  9400], stormSpawnTime: [20000, 30000] },
    { name: 'Epsilon',  tripLength:  35, enemySpawnInterval: 2450, enemyShooterChance: 0,    asteroidSpawnTime: [5000,  9000], stormSpawnTime: [19500, 29000] },
    { name: 'Zeta',     tripLength:  38, enemySpawnInterval: 2350, enemyShooterChance: 0,    asteroidSpawnTime: [4800,  8600], stormSpawnTime: [18500, 28000] },
    { name: 'Eta',      tripLength:  42, enemySpawnInterval: 2250, enemyShooterChance: 0,    asteroidSpawnTime: [4600,  8300], stormSpawnTime: [18000, 27000] },
    { name: 'Theta',    tripLength:  45, enemySpawnInterval: 2150, enemyShooterChance: 0.1,  asteroidSpawnTime: [4400,  7900], stormSpawnTime: [17500, 26000] },
    { name: 'Iota',     tripLength:  49, enemySpawnInterval: 2050, enemyShooterChance: 0.12, asteroidSpawnTime: [4100,  7400], stormSpawnTime: [17000, 25500] },
    { name: 'Kappa',    tripLength:  53, enemySpawnInterval: 1950, enemyShooterChance: 0.15, asteroidSpawnTime: [3900,  7000], stormSpawnTime: [16000, 24000] },
    { name: 'Lambda',   tripLength:  57, enemySpawnInterval: 1850, enemyShooterChance: 0.18, asteroidSpawnTime: [3700,  6700], stormSpawnTime: [15500, 23000] },
    { name: 'Mu',       tripLength:  61, enemySpawnInterval: 1750, enemyShooterChance: 0.2,  asteroidSpawnTime: [3500,  6300], stormSpawnTime: [15000, 22500] },
    { name: 'Nu',       tripLength:  66, enemySpawnInterval: 1650, enemyShooterChance: 0.23, asteroidSpawnTime: [3300,  5900], stormSpawnTime: [14000, 21000] },
    { name: 'Xi',       tripLength:  70, enemySpawnInterval: 1550, enemyShooterChance: 0.25, asteroidSpawnTime: [3100,  5600], stormSpawnTime: [13500, 20000] },
    { name: 'Omicron',  tripLength:  75, enemySpawnInterval: 1450, enemyShooterChance: 0.28, asteroidSpawnTime: [2900,  5200], stormSpawnTime: [13000, 19500] },
    { name: 'Pi',       tripLength:  79, enemySpawnInterval: 1350, enemyShooterChance: 0.3,  asteroidSpawnTime: [2700,  4900], stormSpawnTime: [12000, 18000] },
    { name: 'Rho',      tripLength:  84, enemySpawnInterval: 1250, enemyShooterChance: 0.33, asteroidSpawnTime: [2500,  4500], stormSpawnTime: [11500, 17000] },
    { name: 'Sigma',    tripLength:  89, enemySpawnInterval: 1200, enemyShooterChance: 0.35, asteroidSpawnTime: [2300,  4100], stormSpawnTime: [11000, 16500] },
    { name: 'Tau',      tripLength:  94, enemySpawnInterval: 1100, enemyShooterChance: 0.38, asteroidSpawnTime: [2200,  4000], stormSpawnTime: [10500, 16000] },
    { name: 'Upsilon',  tripLength:  99, enemySpawnInterval: 1000, enemyShooterChance: 0.4,  asteroidSpawnTime: [2000,  3600], stormSpawnTime: [ 9500, 14000] },
    { name: 'Phi',      tripLength: 104, enemySpawnInterval:  900, enemyShooterChance: 0.43, asteroidSpawnTime: [1800,  3200], stormSpawnTime: [ 9000, 13500] },
    { name: 'Chi',      tripLength: 109, enemySpawnInterval:  800, enemyShooterChance: 0.45, asteroidSpawnTime: [1600,  2900], stormSpawnTime: [ 8500, 13000] },
    { name: 'Psi',      tripLength: 115, enemySpawnInterval:  750, enemyShooterChance: 0.47, asteroidSpawnTime: [1400,  2500], stormSpawnTime: [ 7500, 11000] },
    { name: 'Omega',    tripLength: 120, enemySpawnInterval:  650, enemyShooterChance: 0.5,  asteroidSpawnTime: [1200,  2200], stormSpawnTime: [ 7000, 10500] },
];

// Phase 10: galaxy map
export const MAP_FLY_DURATION = 900; // ms for your ship to fly across the map before a level starts
export const GALAXY_STAR_COUNT = 1100; // decorative pencil-square stars in the spiral galaxy
export const GALAXY_STAR_SIZE = 4; // px; the stars sit on a grid of squares this big

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

// Phase 12: building ships and the garage
export const SHIP_TYPES = ['guard', 'scout', 'fighter', 'freighter'] as const;
export type ShipType = typeof SHIP_TYPES[number];

export interface ShipSettings {
    name: string;
    description: string;
    // Sasha has only drawn the Guard so far, so the others reuse it with a different
    // colour and size. When she draws one, load it in BootScene and put its key here.
    sprite: string;
    tint: number; // 0xffffff = the picture's own colours
    displayWidth: number; // px on screen
    recipe: Partial<Record<PartType, number>>; // parts needed to build it (the Guard is free)
    speed: number; // multiplies the ship's speed (1.3 = 30% faster)
    fireDelay: number; // multiplies the time between laser shots (0.6 = shoots much faster)
    shields: number; // extra shields at the start of every trip (can be negative)
    partsPerPickup: number; // how many parts you get for each one you fly over
}

export const SHIPS: Record<ShipType, ShipSettings> = {
    guard: {
        name: 'Guard',
        description: 'Your first ship. Good at everything.',
        sprite: 'shasha_guard', tint: 0xffffff, displayWidth: 80,
        recipe: {},
        speed: 1, fireDelay: 1, shields: 0, partsPerPickup: 1,
    },
    scout: {
        name: 'Scout',
        description: 'Small and very fast, but fragile.',
        sprite: 'shasha_guard', tint: 0x9fffb0, displayWidth: 64,
        recipe: { engine: 2, wing: 2, cockpit: 1 },
        speed: 1.35, fireDelay: 1, shields: -1, partsPerPickup: 1,
    },
    fighter: {
        name: 'Fighter',
        description: 'Shoots lasers much faster.',
        sprite: 'shasha_guard', tint: 0xff9a9a, displayWidth: 84,
        recipe: { cannon: 3, engine: 1, wing: 1, cockpit: 1 },
        speed: 1.05, fireDelay: 0.6, shields: 0, partsPerPickup: 1,
    },
    freighter: {
        name: 'Freighter',
        description: 'Slow and tough. Collects double parts.',
        sprite: 'shasha_guard', tint: 0xffd27a, displayWidth: 100,
        recipe: { engine: 3, wing: 2, cockpit: 2, cannon: 1 },
        speed: 0.8, fireDelay: 1.2, shields: 2, partsPerPickup: 2,
    },
};
export const STARTING_SHIP: ShipType = 'guard';

// Phase 8: touch controls (Sasha's console design)
export const TOUCH_CONSOLE_HEIGHT = 230; // px; the console sits along the bottom of the screen
export const TOUCH_WHEEL_RANGE = 60; // px you drag the steering wheel for full speed

// Phase 13: saving progress
export const SAVE_KEY = 'sashas-space-game-save'; // the name the saved game is stored under in the browser

// Phase 14: art and sound
// The pencil-style sprites, loaded from public/assets/items/. Sasha can replace any of the PNG files.
export const ITEM_SPRITES: string[] = [
    ASSET_KEYS.coin, ASSET_KEYS.bolt, ASSET_KEYS.asteroid, ASSET_KEYS.asteroidGrey, ASSET_KEYS.storm,
    ASSET_KEYS.hyperdriveToken, ASSET_KEYS.sonicBlast, ASSET_KEYS.explosion, ASSET_KEYS.lifeEmpty,
    ASSET_KEYS.systemDone, ASSET_KEYS.systemNext, ASSET_KEYS.systemLocked, ASSET_KEYS.progressEmpty, ASSET_KEYS.progressFull,
    ...PART_TYPES.map(partTextureKey),
    ...Array.from({ length: LIFE_COLOR_COUNT }, (_, i) => lifeTextureKey(i + 1)),
];
// The font for all the writing in the game: chunky pixel letters that sit on the squares
// like the sprites do. It comes with the game (see src/main.ts), so it works offline.
export const GAME_FONT = '"Pixelify Sans", "Chalkboard SE", "Comic Sans MS", sans-serif';
export const HUD_NUMBER_COLOR = '#ffda28'; // pencil yellow
export const HUD_JUMP_COLOR = '#78c8f5'; // pencil light blue
export const SFX_VOLUME = 0.6; // sound effects, 0 (silent) to 1 (loud)
export const MUSIC_VOLUME = 0.4; // background music, 0 to 1
export const MUSIC_TEMPO = 96; // beats per minute
export const MUTE_KEY = 'sashas-space-game-muted'; // where the browser remembers the sound on/off button
