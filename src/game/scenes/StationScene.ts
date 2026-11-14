import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, LEVELS, PART_TYPES, SHOP_ITEMS, partTextureKey } from '../../config';
import type { ShopItem } from '../../config';
import { makeButton } from '../ui/makeButton';
import type { ButtonOptions } from '../ui/makeButton';
import { getGameState } from '../GameState';
import type { GameState } from '../GameState';
import { Marketplace } from '../Marketplace';

type Tab = 'market' | 'garage';

const ITEM_INFO: Record<ShopItem, { name: string; description: string }> = {
    sonicCannon: { name: 'Sonic blast cannon', description: 'Smashes asteroids. Fire with X.' },
    emShield: { name: 'EM shield', description: 'Survive one electromagnetic storm.' },
    extraLife: { name: 'Extra life', description: '+1 shield on your next trip.' },
    speedUpgrade: { name: 'Engine upgrade', description: 'Your ship flies faster.' },
    fireRateUpgrade: { name: 'Laser upgrade', description: 'Shoot faster.' },
    shieldUpgrade: { name: 'Shield upgrade', description: '+1 shield on every trip.' },
};

const GOLD = '#ffd94f';
const TAB_SELECTED_COLOR = 0x3f9e5f;

// The space station at a star system. The marketplace tab is where you sell parts for
// credits and buy gear and upgrades. (The garage tab comes in Phase 12.)
export class StationScene extends Scene {
    private state!: GameState;
    private market!: Marketplace;
    private tab: Tab = 'market';
    // Everything on the current tab. It's thrown away and drawn again after every
    // purchase, so the numbers and buttons are always up to date.
    private content!: Phaser.GameObjects.Container;

    constructor() {
        super('StationScene');
    }

    create() {
        this.state = getGameState(this);
        const stationName = LEVELS[this.state.currentLevel].name;
        this.market = new Marketplace(this.state, stationName);
        this.tab = 'market';

        this.add.text(GAME_WIDTH / 2, 60, `${stationName} Station`, {
            fontFamily: 'Arial Black', fontSize: 40, color: '#ffffff',
        }).setOrigin(0.5);

        this.content = this.add.container(0, 0);
        this.redraw();

        makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 100, 'Back to Galaxy Map', () => {
            this.scene.start('GalaxyMapScene');
        });
    }

    private redraw() {
        this.content.removeAll(true);
        this.addButton(GAME_WIDTH / 2 - 120, 130, 'Marketplace', () => this.showTab('market'),
            { width: 220, height: 56, fontSize: 24, color: this.tab === 'market' ? TAB_SELECTED_COLOR : undefined });
        this.addButton(GAME_WIDTH / 2 + 120, 130, 'Garage', () => this.showTab('garage'),
            { width: 220, height: 56, fontSize: 24, color: this.tab === 'garage' ? TAB_SELECTED_COLOR : undefined });

        if (this.tab === 'market') {
            this.drawMarketplace();
        } else {
            this.addText(GAME_WIDTH / 2, 400, 'Building ships and the garage\nare coming in Phase 12.', 26, '#cccccc')
                .setOrigin(0.5).setAlign('center');
        }
    }

    private showTab(tab: Tab) {
        this.tab = tab;
        this.redraw();
    }

    private drawMarketplace() {
        this.addText(GAME_WIDTH / 2, 200, `Credits: ${this.state.credits}`, 32, GOLD).setOrigin(0.5);
        if (this.market.note) {
            this.addText(GAME_WIDTH / 2, 240, this.market.note, 20, '#9fd0ff').setOrigin(0.5);
        }

        this.addHeading(285, 'Sell parts');
        PART_TYPES.forEach((part, i) => {
            const y = 335 + i * 64;
            const count = this.state.parts[part];
            this.content.add(this.add.image(55, y, partTextureKey(part)).setScale(1.3));
            this.addText(85, y, `${capitalize(part)}  x${count}`, 24).setOrigin(0, 0.5);
            this.addText(400, y, `${this.market.sellPrice(part)} cr`, 22, GOLD).setOrigin(1, 0.5);
            const small = { width: 120, height: 50, fontSize: 22, enabled: count > 0 };
            this.addButton(490, y, 'Sell 1', () => this.sell(part, 1), small);
            this.addButton(630, y, 'Sell all', () => this.sell(part, count), { ...small, width: 130 });
        });

        this.addHeading(615, 'Buy');
        SHOP_ITEMS.forEach((item, i) => {
            const y = 668 + i * 72;
            const info = ITEM_INFO[item];
            this.addText(40, y - 13, `${info.name} ${this.market.status(item)}`, 24).setOrigin(0, 0.5);
            this.addText(40, y + 15, info.description, 18, '#aab3c5').setOrigin(0, 0.5);

            const blocked = this.market.blockedReason(item);
            if (!blocked) {
                this.addText(525, y, `${this.market.buyPrice(item)} cr`, 22, GOLD).setOrigin(1, 0.5);
            }
            this.addButton(625, y, blocked ?? 'Buy', () => this.buy(item),
                { width: 150, height: 52, fontSize: 22, enabled: this.market.canBuy(item) });
        });
    }

    private sell(part: typeof PART_TYPES[number], count: number) {
        this.market.sell(part, count);
        this.redraw();
    }

    private buy(item: ShopItem) {
        this.market.buy(item);
        this.redraw();
    }

    private addHeading(y: number, label: string) {
        this.addText(40, y, label, 28, '#ffffff', 'Arial Black').setOrigin(0, 0.5);
    }

    private addText(x: number, y: number, label: string, fontSize: number, color = '#ffffff', fontFamily = 'Arial') {
        const text = this.add.text(x, y, label, { fontFamily, fontSize, color });
        this.content.add(text);
        return text;
    }

    private addButton(x: number, y: number, label: string, onClick: () => void, options: ButtonOptions) {
        const { rect, text } = makeButton(this, x, y, label, onClick, options);
        this.content.add([rect, text]);
    }
}

function capitalize(word: string) {
    return word[0].toUpperCase() + word.slice(1);
}
