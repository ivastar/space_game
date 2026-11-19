import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { ASSET_KEYS, PART_TYPES, PART_COLORS, PART_SIZE, partTextureKey } from '../../config';
import type { PartType } from '../../config';

// The classic style's pictures. They are all simple shapes drawn by the code when the
// game starts, instead of being loaded from picture files like the pencil sprites.
export function generateClassicTextures(scene: Scene) {
    for (const type of PART_TYPES) {
        generatePartTexture(scene, type);
    }
    generateShieldIconTexture(scene);
    generateCoinTexture(scene);
    generateBoltTexture(scene);
    generateAsteroidTexture(scene);
    generateStormTexture(scene);
    generateHyperdriveTokenTexture(scene);
    generateSonicBlastTexture(scene);
}

// Two curved blue waves, like a sound wave flying upwards.
function generateSonicBlastTexture(scene: Scene) {
    const w = 64;
    const h = 26;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.lineStyle(4, 0x6fe8ff, 1);
    g.beginPath();
    g.arc(w / 2, 34, 30, Math.PI * 1.2, Math.PI * 1.8);
    g.strokePath();
    g.lineStyle(3, 0xd8f8ff, 0.8);
    g.beginPath();
    g.arc(w / 2, 40, 26, Math.PI * 1.25, Math.PI * 1.75);
    g.strokePath();
    g.generateTexture(ASSET_KEYS.sonicBlast, w, h);
    g.destroy();
}

// The coin: a gold circle.
function generateCoinTexture(scene: Scene) {
    const s = 30;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffc928, 1);
    g.fillCircle(s / 2, s / 2, s / 2 - 1);
    g.lineStyle(3, 0xb8860b, 1);
    g.strokeCircle(s / 2, s / 2, s / 2 - 6);
    g.generateTexture(ASSET_KEYS.coin, s, s);
    g.destroy();
}

function generateBoltTexture(scene: Scene) {
    const w = 24;
    const h = 36;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xfff04a, 1);
    g.lineStyle(2, 0xffffff, 1);
    g.beginPath();
    g.moveTo(15, 1);
    g.lineTo(2, 20);
    g.lineTo(11, 20);
    g.lineTo(8, h - 1);
    g.lineTo(w - 2, 14);
    g.lineTo(13, 14);
    g.closePath();
    g.fillPath();
    g.strokePath();
    g.generateTexture(ASSET_KEYS.bolt, w, h);
    g.destroy();
}

// A lumpy grey rock: a circle with a randomly wobbly edge, plus a few craters.
function generateAsteroidTexture(scene: Scene) {
    const s = 64;
    const c = s / 2;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x8a7f74, 1);
    g.lineStyle(2, 0x5b534b, 1);
    g.beginPath();
    const points = 12;
    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const r = Phaser.Math.Between(22, 30);
        const x = c + Math.cos(angle) * r;
        const y = c + Math.sin(angle) * r;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
    }
    g.closePath();
    g.fillPath();
    g.strokePath();
    g.fillStyle(0x6b6259, 1);
    g.fillCircle(c - 8, c - 6, 5);
    g.fillCircle(c + 9, c + 4, 4);
    g.fillCircle(c - 2, c + 12, 3);
    g.generateTexture(ASSET_KEYS.asteroid, s, s);
    g.destroy();
}

// A glowing purple cloud with white crackles of lightning inside.
function generateStormTexture(scene: Scene) {
    const s = 256;
    const c = s / 2;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    for (let r = c; r > 8; r -= 8) {
        g.fillStyle(0xa04cff, 0.06 + (1 - r / c) * 0.12);
        g.fillCircle(c, c, r);
    }
    g.lineStyle(2, 0xe8d4ff, 0.9);
    for (let i = 0; i < 5; i++) {
        let x = c + Phaser.Math.Between(-60, 60);
        let y = c + Phaser.Math.Between(-60, 60);
        g.beginPath();
        g.moveTo(x, y);
        for (let j = 0; j < 4; j++) {
            x += Phaser.Math.Between(-18, 18);
            y += Phaser.Math.Between(-18, 18);
            g.lineTo(x, y);
        }
        g.strokePath();
    }
    g.generateTexture(ASSET_KEYS.storm, s, s);
    g.destroy();
}

// A blue token with a white double arrow pointing up: one hyperdrive jump charge.
function generateHyperdriveTokenTexture(scene: Scene) {
    const s = 30;
    const c = s / 2;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x2a5cff, 1);
    g.fillCircle(c, c, c - 1);
    g.lineStyle(2, 0xffffff, 1);
    g.strokeCircle(c, c, c - 1);
    g.lineStyle(3, 0xffffff, 1);
    for (const top of [9, 15]) {
        g.beginPath();
        g.moveTo(c - 6, top + 6);
        g.lineTo(c, top);
        g.lineTo(c + 6, top + 6);
        g.strokePath();
    }
    g.generateTexture(ASSET_KEYS.hyperdriveToken, s, s);
    g.destroy();
}

// Placeholder HUD shield icon (one per remaining shield hit).
function generateShieldIconTexture(scene: Scene) {
    const w = 28;
    const h = 32;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x4fa8ff, 1);
    g.lineStyle(2, 0xffffff, 1);
    g.beginPath();
    g.moveTo(1, 1);
    g.lineTo(w - 1, 1);
    g.lineTo(w - 1, h * 0.55);
    g.lineTo(w / 2, h - 1);
    g.lineTo(1, h * 0.55);
    g.closePath();
    g.fillPath();
    g.strokePath();
    g.generateTexture(ASSET_KEYS.shieldIcon, w, h);
    g.destroy();
}

// Placeholder part icons — a different shape and colour per part type,
// until Sasha draws real ones.
function generatePartTexture(scene: Scene, type: PartType) {
    const s = PART_SIZE;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(PART_COLORS[type], 1);
    g.lineStyle(2, 0xffffff, 1);
    switch (type) {
        case 'engine':
            g.fillCircle(s / 2, s / 2, s / 2 - 1);
            g.strokeCircle(s / 2, s / 2, s / 2 - 1);
            break;
        case 'wing':
            g.fillTriangle(1, s - 1, s - 1, s - 1, s / 2, 1);
            g.strokeTriangle(1, s - 1, s - 1, s - 1, s / 2, 1);
            break;
        case 'cockpit':
            // A diamond, drawn as a top and a bottom triangle.
            g.fillTriangle(1, s / 2, s - 1, s / 2, s / 2, 1);
            g.fillTriangle(1, s / 2, s - 1, s / 2, s / 2, s - 1);
            g.beginPath();
            g.moveTo(s / 2, 1);
            g.lineTo(s - 1, s / 2);
            g.lineTo(s / 2, s - 1);
            g.lineTo(1, s / 2);
            g.closePath();
            g.strokePath();
            break;
        case 'cannon':
            g.fillRect(s / 4, 1, s / 2, s - 2);
            g.strokeRect(s / 4, 1, s / 2, s - 2);
            break;
    }
    g.generateTexture(partTextureKey(type), s, s);
    g.destroy();
}
