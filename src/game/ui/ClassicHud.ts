import * as Phaser from 'phaser';
import { ASSET_KEYS, GAME_WIDTH, PART_TYPES, HYPERDRIVE_TOKENS_PER_JUMP } from '../../config';
import type { PartType } from '../../config';
import type { Hud } from './Hud';

const DEPTH = 10;

// The classic style's counters: shield icons and jumps on the right,
// the number of parts and your gear on the left.
export class ClassicHud implements Hud {
    private shieldIcons: Phaser.GameObjects.Image[] = [];
    private partsText: Phaser.GameObjects.Text;
    private tokenIcon: Phaser.GameObjects.Image;
    private jumpsText: Phaser.GameObjects.Text;
    private gearText: Phaser.GameObjects.Text;

    constructor(private scene: Phaser.Scene) {
        this.partsText = scene.add.text(20, 110, '', {
            fontFamily: 'Arial', fontSize: 28, color: '#ffffff',
        }).setDepth(DEPTH);
        this.gearText = scene.add.text(20, 148, '', {
            fontFamily: 'Arial', fontSize: 20, color: '#9fd0ff',
        }).setDepth(DEPTH);
        this.tokenIcon = scene.add.image(0, 110, ASSET_KEYS.hyperdriveToken).setDepth(DEPTH);
        this.jumpsText = scene.add.text(GAME_WIDTH - 20, 110, '', {
            fontFamily: 'Arial', fontSize: 26, color: '#ffffff',
        }).setOrigin(1, 0.5).setDepth(DEPTH);
    }

    // One shield icon for each hit you can still take.
    setLives(lives: number) {
        for (const icon of this.shieldIcons) icon.destroy();
        this.shieldIcons = [];
        for (let i = 0; i < lives; i++) {
            this.shieldIcons.push(this.scene.add.image(GAME_WIDTH - 30 - i * 38, 60, ASSET_KEYS.shieldIcon).setDepth(DEPTH));
        }
    }

    setParts(parts: Record<PartType, number>) {
        const total = PART_TYPES.reduce((sum, t) => sum + parts[t], 0);
        this.partsText.setText(`Parts: ${total}`);
    }

    setJumps(tokens: number, jumps: number) {
        this.jumpsText.setText(`${tokens}/${HYPERDRIVE_TOKENS_PER_JUMP}   Jumps: ${jumps}`);
        this.tokenIcon.setX(this.jumpsText.x - this.jumpsText.width - 22);
    }

    showJumps(visible: boolean) {
        this.tokenIcon.setVisible(visible);
        this.jumpsText.setVisible(visible);
    }

    flashJumps() {
        this.jumpsText.setColor('#ff4444');
        this.scene.time.delayedCall(300, () => this.jumpsText.setColor('#ffffff'));
    }

    setGear(text: string) {
        this.gearText.setText(text);
    }
}
