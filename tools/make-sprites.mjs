// Draws the stand-in sprites in the style of Sasha's notebook: shapes that follow the
// squares of graph paper, coloured in with school pencils, with a dark pencil outline.
//
// Run it with:   node tools/make-sprites.mjs
// It writes PNG files into assets/items/ and public/assets/items/.
// When Sasha draws a real sprite, save it over the PNG with the same name
// (in both folders). After that, only redraw the sprites you name, so the
// script doesn't draw over Sasha's:   node tools/make-sprites.mjs coin bolt

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIRS = [join(ROOT, 'assets/items'), join(ROOT, 'public/assets/items')];

// The pencil case. Each letter in a drawing below is one of these colours.
const PENCILS = {
    R: [232, 48, 48], // red
    O: [245, 140, 36], // orange
    Y: [255, 218, 40], // yellow
    y: [255, 240, 150], // pale yellow
    g: [150, 220, 60], // light green
    G: [52, 190, 72], // green
    B: [44, 108, 228], // blue
    b: [120, 200, 245], // light blue
    P: [222, 80, 160], // pink
    N: [184, 118, 60], // brown
    n: [92, 62, 40], // dark brown
    S: [172, 172, 176], // grey
    s: [104, 104, 110], // dark grey
    W: [246, 243, 232], // white (the paper)
};
const PAPER = [246, 243, 232];
const GRAPHITE = [58, 58, 62]; // the ordinary pencil used for outlines
const EMPTY_SLOT = [34, 40, 58, 170]; // 'x': a dim, see-through square (an empty life)
const OUTLINE = 2; // px of outline around every shape

// --- The drawings. Each character is one square of graph paper; '.' is empty. ---

const coin = { cell: 3, rows: [
    '....YYYY....',
    '..YYYYYYYY..',
    '.YYYYYYYYYY.',
    '.YYYYYYYYYY.',
    'YYYYyyyyYYYY',
    'YYYYyyyyYYYY',
    'YYYYyyyyYYYY',
    'YYYYyyyyYYYY',
    '.YYYYYYYYYY.',
    '.YYYYYYYYYY.',
    '..YYYYYYYY..',
    '....YYYY....',
] };

const bolt = { cell: 3, rows: [
    '.....YYYY.',
    '....YYYY..',
    '...YYYY...',
    '..YYYY....',
    '.YYYYYYYY.',
    '.YYYYYYY..',
    '....YYYY..',
    '...YYYY...',
    '..YYYY....',
    '.YYYY.....',
    '.YYY......',
    'YY........',
] };

const hyperdriveToken = { cell: 3, rows: [
    '....BBBB....',
    '..BBBBBBBB..',
    '.BBBBWWBBBB.',
    '.BBBWWWWBBB.',
    'BBBWWBBWWBBB',
    'BBWWBBBBWWBB',
    'BBBBBWWBBBBB',
    'BBBBWWWWBBBB',
    '.BBWWBBWWBB.',
    '.BWWBBBBWWB.',
    '..BBBBBBBB..',
    '....BBBB....',
] };

const asteroid = { cell: 4, rows: [
    '.....NNNNN......',
    '...NNNNNNNNN....',
    '..NNNnnNNNNNN...',
    '.NNNNnnNNNNNNN..',
    '.NNNNNNNNNNnNNN.',
    'NNNNNNNNNNNNNNN.',
    'NNNNNNNNNNNNNNNN',
    'NNnNNNNNNnnNNNNN',
    'NNNNNNNNNnnNNNNN',
    'NNNNNNNNNNNNNNNN',
    '.NNNNNnNNNNNNNN.',
    '.NNNNNNNNNNNnNN.',
    '..NNNNNNNNNNNN..',
    '...NNNNNNNNNN...',
    '....NNNNNNNN....',
    '......NNNN......',
] };

const asteroid_grey = { cell: 5, rows: [
    '..SSSS...SS.',
    '.SSSSSS.SSSS',
    'SSSSSSSSSSSS',
    'SSSsSSSSSSSS',
    'SSSSSSSSSsSS',
    'SSSSSSSSSSSS',
    'SSSSSSSSSSSS',
    '.SSSSsSSSSS.',
    '.SSSSSSSSSS.',
    '..SSSSSSSS..',
    '...SSSSSS...',
    '.....SS.....',
] };

// Ship parts.
const part_engine = { cell: 3, rows: [
    '....SSSS....',
    '...SSSSSS...',
    '...SSSSSS...',
    '..SSsSSsSS..',
    '..SSSSSSSS..',
    '.SSSSSSSSSS.',
    '.ssssssssss.',
    '..OOOOOOOO..',
    '..OOYYYYOO..',
    '...OYYYYO...',
    '....OYYO....',
    '.....OO.....',
] };

const part_wing = { cell: 3, rows: [
    '............',
    '.........BBB',
    '.......BBBBB',
    '.....BBBBBBB',
    '...BBBBBBBBB',
    '..BBBBbbbBBB',
    '.BBBBbbbBBBB',
    'BBBBBBBBBBBB',
    'RRRRRRRRRRRR',
    '.RRRRRRRRRR.',
    '............',
    '............',
] };

const part_cockpit = { cell: 3, rows: [
    '............',
    '....YYYY....',
    '..YYbbbbYY..',
    '.YYbbWbbbYY.',
    '.YbbWbbbbbY.',
    'YYbbbbbbbbYY',
    'YYbbbbbbbbYY',
    'YYYYYYYYYYYY',
    'SSSSSSSSSSSS',
    '.SSSSSSSSSS.',
    '............',
    '............',
] };

const part_cannon = { cell: 3, rows: [
    '.....RR.....',
    '.....RR.....',
    '.....SS.....',
    '.....SS.....',
    '.....SS.....',
    '....SSSS....',
    '....SSSS....',
    '...SSssSS...',
    '..SSSssSSS..',
    '..SSSSSSSS..',
    '.SSSSSSSSSS.',
    '.ssssssssss.',
] };

const explosion = { cell: 4, rows: [
    '.......R........',
    '..R....RR....R..',
    '...RR..RR...RR..',
    '...RRR.ROR.RRR..',
    '....RROOOORRR...',
    '.RR.ROOYYOOR..R.',
    '..RRROYYYYOORRR.',
    '...ROOYWWYYOOR..',
    'RRRROYYWWYYORR..',
    '..RROOYYYYOOR...',
    '...RROOYYOORRR..',
    '..RRRROOOORR.RR.',
    '..RR..ROOR...R..',
    '.R....RRR.......',
    '.......RR.......',
    '.......R........',
] };

const sonic_blast = { cell: 4, rows: [
    '......bbbbbbbb......',
    '...bbbb......bbbb...',
    '.bbb....BBBB....bbb.',
    'bb....BBB..BBB....bb',
    '....BBB......BBB....',
    '...BB..........BB...',
] };

// Star systems on the galaxy map: one you've finished, the next one, and a locked one.
const system_done = { cell: 2, rows: [
    '......B......',
    '......B......',
    '.....BBB.....',
    '.....BBB.....',
    '...BBBBBBB...',
    'BBBBBBbBBBBBB',
    '...BBBBBBB...',
    '.....BBB.....',
    '.....BBB.....',
    '......B......',
    '......B......',
] };

const system_next = { cell: 3, rows: [
    '......Y......',
    '......Y......',
    '.....YYY.....',
    '.....YYY.....',
    '...YYYYYYY...',
    'YYYYYYyYYYYYY',
    '...YYYYYYY...',
    '.....YYY.....',
    '.....YYY.....',
    '......Y......',
    '......Y......',
] };

const system_locked = { cell: 2, rows: [
    '..SSS..',
    '.SSSSS.',
    'SSSsSSS',
    'SSsssSS',
    'SSSsSSS',
    '.SSSSS.',
    '..SSS..',
] };

// The trip progress bar: an empty one, and a coloured-in one that is uncovered bit by bit.
const bar = (c) => ({ cell: 4, rows: Array(4).fill(c.repeat(80)) });

// One square of the lives bar, in each of its colours (plus an empty one).
const lifeCell = (c) => ({ cell: 4, rows: Array(6).fill(c.repeat(8)) });

const DRAWINGS = {
    coin, bolt, hyperdrive_token: hyperdriveToken, asteroid, asteroid_grey,
    part_engine, part_wing, part_cockpit, part_cannon, explosion, sonic_blast,
    life_empty: lifeCell('x'), life_1: lifeCell('R'), life_2: lifeCell('O'),
    life_3: lifeCell('Y'), life_4: lifeCell('g'), life_5: lifeCell('G'),
    system_done, system_next, system_locked, progress_empty: bar('x'), progress_full: bar('B'),
};

// --- Colouring in ---

// A random number generator that gives the same numbers every time, so the
// sprites come out the same whenever the script is run.
function makeRandom(seed) {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

// One pixel of coloured pencil: slanted strokes with a little paper showing through.
function pencil(color, x, y, random) {
    let c = color.map(v => v * (0.9 + 0.1 * random()));
    if ((x + y) % 4 === 0) c = mix(c, PAPER, 0.28);
    if (random() < 0.1) c = mix(c, PAPER, 0.3);
    return [...c.map(Math.round), 255];
}

function graphite(random) {
    const shade = 0.85 + 0.3 * random();
    return [...GRAPHITE.map(v => Math.round(v * shade)), 255];
}

class Picture {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = new Uint8Array(width * height * 4);
    }

    set(x, y, [r, g, b, a]) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
        this.data.set([r, g, b, a], (y * this.width + x) * 4);
    }

    alpha(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 0;
        return this.data[(y * this.width + x) * 4 + 3];
    }
}

// Turns a drawing made of letters into a coloured-in picture with pencil outlines.
function colourIn({ cell, rows }, seed) {
    const random = makeRandom(seed);
    const w = rows[0].length * cell + OUTLINE * 2;
    const h = rows.length * cell + OUTLINE * 2;
    const letterAt = (x, y) => {
        const row = rows[Math.floor((y - OUTLINE) / cell)];
        return (y >= OUTLINE && x >= OUTLINE && row?.[Math.floor((x - OUTLINE) / cell)]) || '.';
    };

    const picture = new Picture(w, h);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const letter = letterAt(x, y);
            if (letter === '.') {
                // The outline: empty pixels right next to the shape.
                let near = false;
                for (let dy = -OUTLINE; dy <= OUTLINE && !near; dy++) {
                    for (let dx = -OUTLINE; dx <= OUTLINE && !near; dx++) {
                        if (dx * dx + dy * dy <= OUTLINE * OUTLINE + 1 && letterAt(x + dx, y + dy) !== '.') near = true;
                    }
                }
                if (near) picture.set(x, y, graphite(random));
                continue;
            }
            // A thin pencil line wherever two colours meet.
            const right = letterAt(x + 1, y);
            const below = letterAt(x, y + 1);
            if ((right !== '.' && right !== letter) || (below !== '.' && below !== letter)) {
                picture.set(x, y, graphite(random));
            } else if (letter === 'x') {
                picture.set(x, y, EMPTY_SLOT);
            } else {
                picture.set(x, y, pencil(PENCILS[letter], x, y, random));
            }
        }
    }
    return picture;
}

// The electromagnetic storm: a big yellow zig-zag scribble, like in Sasha's drawing.
function drawStorm(seed) {
    const random = makeRandom(seed);
    const size = 128;
    const c = size / 2;
    const picture = new Picture(size, size);
    const yellow = PENCILS.Y;

    // A faint yellow glow, so you can see where the dangerous part is.
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const d = Math.hypot(x - c, y - c) / c;
            if (d < 0.8 && random() < 0.5) picture.set(x, y, [...yellow, Math.round(70 * (1 - d))]);
        }
    }

    // The scribble goes round and round, darting in and out.
    const points = [];
    const count = 46;
    for (let i = 0; i <= count; i++) {
        const angle = (i / count) * Math.PI * 2 * 3 + random() * 0.3;
        const radius = (i % 2 === 0 ? 30 + random() * 28 : 8 + random() * 26);
        points.push([c + Math.cos(angle) * radius, c + Math.sin(angle) * radius]);
    }
    for (let i = 1; i < points.length; i++) {
        const [x0, y0] = points[i - 1];
        const [x1, y1] = points[i];
        const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
        for (let s = 0; s <= steps; s++) {
            const x = Math.round(x0 + ((x1 - x0) * s) / steps);
            const y = Math.round(y0 + ((y1 - y0) * s) / steps);
            for (const [dx, dy] of [[0, 0], [1, 0], [0, 1]]) {
                picture.set(x + dx, y + dy, [...mix(yellow, PAPER, random() * 0.4), 255]);
            }
        }
    }
    return picture;
}

// --- Saving PNG files ---

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
});

function crc32(bytes) {
    let c = 0xffffffff;
    for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
    const body = Buffer.concat([Buffer.from(type), data]);
    const out = Buffer.alloc(body.length + 8);
    out.writeUInt32BE(data.length, 0);
    body.copy(out, 4);
    out.writeUInt32BE(crc32(body), body.length + 4);
    return out;
}

export function toPng({ width, height, data }) {
    const header = Buffer.alloc(13);
    header.writeUInt32BE(width, 0);
    header.writeUInt32BE(height, 4);
    header.set([8, 6, 0, 0, 0], 8); // 8 bits per colour, with see-through (RGBA)
    const lines = Buffer.alloc(height * (width * 4 + 1));
    for (let y = 0; y < height; y++) {
        Buffer.from(data.buffer, y * width * 4, width * 4).copy(lines, y * (width * 4 + 1) + 1);
    }
    return Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk('IHDR', header),
        chunk('IDAT', deflateSync(lines)),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

export function makeAll() {
    const pictures = {};
    Object.entries(DRAWINGS).forEach(([name, drawing], i) => {
        pictures[name] = colourIn(drawing, 1000 + i);
    });
    pictures.storm = drawStorm(7);
    return pictures;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const only = process.argv.slice(2);
    const pictures = Object.fromEntries(
        Object.entries(makeAll()).filter(([name]) => only.length === 0 || only.includes(name)),
    );
    for (const dir of OUT_DIRS) {
        mkdirSync(dir, { recursive: true });
        for (const [name, picture] of Object.entries(pictures)) {
            writeFileSync(join(dir, `${name}.png`), toPng(picture));
        }
    }
    console.log(`Drew ${Object.keys(pictures).length} sprites: ${Object.keys(pictures).join(', ')}`);
}
