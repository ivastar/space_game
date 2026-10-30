# Sasha's Space Game – Build Plan for Claude Code

Paste this into Claude Code one phase at a time. Finish each phase, test it in the browser with `npm run dev`, and commit to Git before you move on.

## Project context (give this to Claude Code first)

We are building a 2D browser game in **TypeScript + Phaser 3 + Vite**. The project was created with the official Phaser Vite TypeScript template and is already in a Git repo. The game must run fully in the browser as static files, with no backend, so it can be played locally or hosted on GitHub Pages. It should work on a laptop (keyboard) and on an iPad (touch).

**Game concept:** The player flies a small good-guy spaceship through a galaxy, from star system to star system, like the galaxy map in Star Wars. Each star system is a level: a vertical scroller where the ship flies **upwards** (bottom to top) and things come down from the top. The player shoots bad ships and collects the parts they drop. Between levels, at each star system, the player can sell parts on the **dark marketplace**, upgrade their ship, or build new ships and park them in a **garage**.

**Rules:**

- The player starts with 3 lives (shield hits). After 3 hits the shield is gone, and the 4th hit destroys the ship.
- **Bad ships** enter from the top. Shoot them to destroy them. They drop ship parts that you can collect.
- **Coins** give +1 life.
- **Lightning bolts** give a temporary speed boost.
- **Asteroids** kill or damage you on contact. You can destroy them only with the **sonic blast cannon**, which you buy at the marketplace.
- **Electromagnetic storms** kill instantly unless you have an **electromagnetic shield**, which you can buy, trade for, or find.
- **Hyperspeed** is a special boost button.

**Controls:**

- Laptop: arrow keys to steer, Space to shoot, Shift for hyperspeed.
- Touch screen: a control console at the bottom of the screen with a steering wheel (or a D-pad), two pink blast buttons, and a hyperspeed button.

**Coding guidelines:** Keep the code modular, with one class per file in `src/`. Put all tunable numbers (speeds, spawn rates, prices) in one `src/config.ts`. Use simple placeholder shapes for graphics at first, so that real sprites can be swapped in later. Keep it simple and readable, because a kid is helping build this.

## Phase 1 – Scene skeleton

Set up these Phaser scenes with simple placeholder screens and buttons to move between them: `BootScene` (loads assets), `MenuScene` (title and Start button), `GalaxyMapScene`, `LevelScene`, `StationScene` (marketplace and garage), and `GameOverScene`. Set a portrait-friendly game size (for example 720×1280) with Phaser's scale mode FIT, so it fits phones, iPads and laptops.

**Test:** you can click through every scene.

## Phase 2 – Flying the ship

In `LevelScene`, add the player ship near the bottom and a scrolling starfield background (two parallax layers) to give the feeling of flying upwards. Arrow keys move the ship left, right, up and down within the screen bounds.

**Test:** the ship moves smoothly and the stars scroll.

## Phase 3 – Shooting

The Space key fires laser bullets upwards. Use a Phaser object pool (group) for bullets, add a fire-rate limit, and remove bullets once they leave the screen.

## Phase 4 – Enemies and parts

Bad ships spawn at the top and fly down in simple patterns: straight down, zig-zag, and occasionally shooting back. When a bullet hits a bad ship, it explodes and drops 1–3 ship parts (for example engine, wing, cockpit, cannon). The player collects parts by flying over them. Show a parts counter in the HUD.

## Phase 5 – Lives, shield and game over

Add the lives system: 3 shield hits, then the 4th hit means game over. Add a short invincibility flash after each hit. The HUD shows lives as shield icons. Enemy bullets and collisions with enemies cause hits. At game over, go to `GameOverScene` with a Retry button.

## Phase 6 – Space objects

Spawn these from the top at rates set in the config:

- **Coins:** +1 life (with a maximum set in the config).
- **Lightning bolts:** speed boost for about 5 seconds.
- **Asteroids:** count as a hit on contact. Normal lasers bounce off them. Only the sonic blast cannon can destroy them.
- **Electromagnetic storms:** large, slow, glowing areas. Touching one is instant death unless the player has an EM shield, which absorbs one storm and is then used up.

## Phase 7 – Hyperspeed

Shift (or the touch button) triggers hyperspeed: the stars stretch, scrolling speeds up, and the ship is briefly harder to hit. Then a cooldown starts, shown as a small bar in the HUD.

## Phase 8 – Touch controls

Detect touch devices and show a control console at the bottom of the screen: a virtual steering wheel or joystick on the left, two pink blast buttons and a hyperspeed button on the right. Support multitouch, so you can steer and shoot at the same time. Hide the console on keyboard devices.

**Test:** use Chrome DevTools device mode, then a real iPad on the same Wi‑Fi network, running `npm run dev -- --host`.

## Phase 9 – Level structure

Each level is one trip to a star system and lasts a set distance or time, shown by a progress bar. Difficulty (enemy count, asteroids, storms) comes from per-level settings in the config. When the player reaches the end, they arrive at the star system and go to `StationScene`.

## Phase 10 – Galaxy map

`GalaxyMapScene` shows star systems as dots connected by routes. The player starts at the first system, and finishing a level unlocks the next ones. Click or tap a system you can reach to fly there, which starts that level.

## Phase 11 – Dark marketplace

In `StationScene`, the marketplace tab lets the player sell parts for credits and buy things: the sonic blast cannon, EM shields, extra lives, and upgrades for speed, fire rate and shield. Prices are in the config, and some systems can have different prices.

## Phase 12 – Building ships and the garage

Ship recipes say which parts you need to build each ship (for example scout, fighter, freighter, each with different stats). Built ships are parked in the garage, and the player can choose which ship to fly next.

## Phase 13 – Saving progress

Save credits, parts, upgrades, garage ships and unlocked systems to `localStorage`, so progress stays after the browser is closed. Add Continue and New Game options to the menu.

## Phase 14 – Art and sound

Replace the placeholder shapes with real sprites, for example pixel art drawn by Sasha, saved as PNG files in `public/assets/`. Add sound effects (laser, explosion, pickup) and background music, with a mute button. Remember that iPads only play audio after the first tap.

## Phase 15 – Publishing

Run `npm run build` and deploy the `dist/` folder to GitHub Pages using a GitHub Actions workflow. Set the Vite `base` path to match the repo name.

## Ideas for later

Boss ships, more weapons, missions from traders at stations, a high score table, and different galaxies.
