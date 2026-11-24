## Sasha's Space Game

A 2D space shooter that flies through a galaxy, imagined by Sasha Davies, an 8-year-old game designer, and built together with his mom.

**[Play the game here](https://ivastar.github.io/space_game)**

![Sasha, game designer and playtester](profile_pic.png)

## About Sasha

Sasha (seen here in his Halloween costume) is the game designer and lead playtester. He has been drawing spaceships for his imaginary world for a really long time, and we wanted to turn those drawings into a real game you can actually fly. His favorite feature is the hyperdrive.

## How the Game Was Made

This game started with Sasha's notebook drawings. He drew the ships on paper, and then converted them into pixel art via [PixilArt](https://www.pixilart.com), so the ships you fly and fight in the game are his designs.

Sasha described the overall design and ideas for the game. Then he typed the commands to Claude Code to design each individual phase of the build, and he typed the git commands to save the game stage by stage. After each stage a few handpicked testers tried it, and Sasha's feedback shaped the next changes.

The game is written in TypeScript using Phaser and Vite, and it runs in the browser, either locally or hosted on a server. It was built with [Claude Code](https://claude.com/claude-code).

<!--
## The Original Drawings

Here are Sasha's original notebook drawings next to the pixel art versions in the game.

![Sasha's original notebook drawings of the ships](images/drawings.jpg)
-->

## How to Play

You fly a ship upward through a galaxy, from star system to star system.

- **Arrow keys:** fly left, right, up and down
- **Space bar:** shoot
- **Shift:** hyper jump

## Features

- 24 levels named after Greek letters, from Alpha to Omega, unlocked one after another on a galaxy-shaped map
- Difficulty grows gradually, with one new ship or obstacle type in each level in the first 9 levels
- Shoot the bad ships and collect the part that each one drops
- Sell parts on the dark marketplace, or use them to build new ships and park them in your garage
- Enemies also drop hyperdrive tokens, and three of them charge one hyper jump
- The hyperdrive ramps up and down like in Star Wars, all the stars streak past, and nothing can hit you during the jump

## Running It Locally

You need [Node.js](https://nodejs.org) to install the dependencies and run the scripts with `npm`.

Clone the repository, then run `npm install` in the project folder, followed by `npm run dev`. Open the address it prints in your browser (`http://localhost:8080` by default; see the Vite documentation to change the port or add SSL support).

While the server is running you can edit any of the files in the `src` folder. Vite recompiles the code and reloads the browser automatically.

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |
| `npm run dev-nolog` | Launch a development web server without sending anonymous data (see "About log.js" below) |
| `npm run build-nolog` | Create a production build in the `dist` folder without sending anonymous data (see "About log.js" below) |

### About log.js

This project started from Phaser's game template. Its `npm run dev` and `npm run build` commands run a small script, `log.js`, that sends an anonymous message to Phaser's server saying which command was run, with the Phaser version and the project name. The `-nolog` versions do the same thing without sending anything. The published game on GitHub Pages is built with `build-nolog`.

## License

This project is released under the MIT license. The full text is in the LICENSE file in this repository.

