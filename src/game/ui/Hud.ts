import * as Phaser from 'phaser';
import {
    ASSET_KEYS, GAME_WIDTH, PART_TYPES, PLAYER_MAX_SHIELDS, HYPERDRIVE_TOKENS_PER_JUMP,
    GAME_FONT, HUD_NUMBER_COLOR, HUD_JUMP_COLOR, partTextureKey, lifeTextureKey,
} from '../../config';
import type { PartType } from '../../config';
import { isPencil } from '../style';
import { ClassicHud } from './ClassicHud';

const RIGHT = GAME_WIDTH - 16;
const LIVES_Y = 40;
const PARTS_Y = 88;
const JUMPS_Y = 136;
const GEAR_Y = 172;
const LIFE_SPACING = 40;
const PART_SLOT_WIDTH = 84;
const DEPTH = 10;

// The counters on screen while you fly. Each style draws them its own way.
export interface Hud {
    setLives(lives: number): void;
    setParts(parts: Record<PartType, number>): void;
    // e.g. "2/3   Jumps: 1": tokens towards the next jump, and jumps you can use now.
    setJumps(tokens: number, jumps: number): void;
    // Tokens and jumps are hidden until hyperdrive tokens have been introduced.
    showJumps(visible: boolean): void;
    // Flashes the jump counter red, so you can see why a jump didn't happen.
    flashJumps(): void;
    // A reminder of the marketplace gear you have on board.
    setGear(text: string): void;
}

export function makeHud(scene: Phaser.Scene): Hud {
    return isPencil ? new PencilHud(scene) : new ClassicHud(scene);
}

// The pencil style's counters, all in the top-right corner like the box in Sasha's drawing:
// the lives bar, the parts you've collected, and your hyperdrive tokens and jumps.
class PencilHud implements Hud {
    private lifeCells: Phaser.GameObjects.Image[] = [];
    private partCounts = {} as Record<PartType, Phaser.GameObjects.Text>;
    private tokenIcon: Phaser.GameObjects.Image;
    private jumpsText: Phaser.GameObjects.Text;
    private gearText: Phaser.GameObjects.Text;

    constructor(private scene: Phaser.Scene) {
        // Lives: a row of squares that fills up from red (on the left) to green.
        for (let i = 0; i < PLAYER_MAX_SHIELDS; i++) {
            const x = RIGHT - 18 - (PLAYER_MAX_SHIELDS - 1 - i) * LIFE_SPACING;
            this.lifeCells.push(scene.add.image(x, LIVES_Y, ASSET_KEYS.lifeEmpty).setDepth(DEPTH));
        }

        // Parts: a picture of each kind with how many you have.
        PART_TYPES.forEach((part, i) => {
            const left = RIGHT - (PART_TYPES.length - i) * PART_SLOT_WIDTH;
            scene.add.image(left + 20, PARTS_Y, partTextureKey(part)).setDepth(DEPTH);
            this.partCounts[part] = this.addText(left + 42, PARTS_Y, 26, HUD_NUMBER_COLOR).setOrigin(0, 0.5);
        });

        this.tokenIcon = scene.add.image(0, JUMPS_Y, ASSET_KEYS.hyperdriveToken).setDepth(DEPTH);
        this.jumpsText = this.addText(RIGHT, JUMPS_Y, 26, HUD_JUMP_COLOR).setOrigin(1, 0.5);
        this.gearText = this.addText(RIGHT, GEAR_Y, 20, '#ffffff').setOrigin(1, 0.5);
    }

    setLives(lives: number) {
        this.lifeCells.forEach((cell, i) => {
            cell.setTexture(i < lives ? lifeTextureKey(i + 1) : ASSET_KEYS.lifeEmpty);
        });
    }

    setParts(parts: Record<PartType, number>) {
        for (const part of PART_TYPES) {
            this.partCounts[part].setText(`${parts[part]}`);
        }
    }

    setJumps(tokens: number, jumps: number) {
        this.jumpsText.setText(`${tokens}/${HYPERDRIVE_TOKENS_PER_JUMP}   Jumps: ${jumps}`);
        this.tokenIcon.setX(RIGHT - this.jumpsText.width - 26);
    }

    showJumps(visible: boolean) {
        this.tokenIcon.setVisible(visible);
        this.jumpsText.setVisible(visible);
    }

    flashJumps() {
        this.jumpsText.setColor('#ff4444');
        this.scene.time.delayedCall(300, () => this.jumpsText.setColor(HUD_JUMP_COLOR));
    }

    setGear(text: string) {
        this.gearText.setText(text);
    }

    private addText(x: number, y: number, fontSize: number, color: string) {
        return this.scene.add.text(x, y, '', {
            fontFamily: GAME_FONT, fontSize, color, fontStyle: 'bold', stroke: '#2a2a2e', strokeThickness: 5,
        }).setDepth(DEPTH);
    }
}
