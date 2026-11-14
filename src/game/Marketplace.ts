import {
    PART_SELL_PRICES, SHOP_PRICES, STATION_PRICES, PLAYER_MAX_SHIELDS,
    UPGRADE_MAX_LEVEL, SHIELD_UPGRADE_MAX_LEVEL,
} from '../config';
import type { PartType, ShopItem } from '../config';
import type { GameState, UpgradeKind } from './GameState';
import { startingShields } from './GameState';

const UPGRADE_FOR: Partial<Record<ShopItem, UpgradeKind>> = {
    speedUpgrade: 'speed',
    fireRateUpgrade: 'fireRate',
    shieldUpgrade: 'shield',
};

const MAX_LEVEL: Record<UpgradeKind, number> = {
    speed: UPGRADE_MAX_LEVEL,
    fireRate: UPGRADE_MAX_LEVEL,
    shield: SHIELD_UPGRADE_MAX_LEVEL,
};

// The rules of the dark marketplace at one station: prices, what you can buy,
// and what happens when you buy or sell. (StationScene draws the buttons.)
export class Marketplace {
    readonly note: string | null;
    private buyMultiplier: number;
    private sellMultiplier: number;

    constructor(private state: GameState, stationName: string) {
        const prices = STATION_PRICES[stationName];
        this.buyMultiplier = prices?.buy ?? 1;
        this.sellMultiplier = prices?.sell ?? 1;
        this.note = prices?.note ?? null;
    }

    sellPrice(part: PartType) {
        return Math.round(PART_SELL_PRICES[part] * this.sellMultiplier);
    }

    sell(part: PartType, count: number) {
        const sold = Math.min(count, this.state.parts[part]);
        this.state.parts[part] -= sold;
        this.state.credits += sold * this.sellPrice(part);
    }

    buyPrice(item: ShopItem) {
        const upgrade = UPGRADE_FOR[item];
        const nextLevel = upgrade ? this.state.upgrades[upgrade] + 1 : 1;
        return Math.round(SHOP_PRICES[item] * nextLevel * this.buyMultiplier);
    }

    // Why you can't buy this right now ('Owned', 'Maxed', 'Full'), or null if you can.
    // Not having enough credits doesn't count here — see canBuy().
    blockedReason(item: ShopItem): string | null {
        const shieldsFull = startingShields(this.state) >= PLAYER_MAX_SHIELDS;
        const upgrade = UPGRADE_FOR[item];
        if (upgrade && this.state.upgrades[upgrade] >= MAX_LEVEL[upgrade]) return 'Maxed';
        if (item === 'sonicCannon' && this.state.hasSonicCannon) return 'Owned';
        if ((item === 'extraLife' || item === 'shieldUpgrade') && shieldsFull) return 'Full';
        return null;
    }

    canBuy(item: ShopItem) {
        return this.blockedReason(item) === null && this.state.credits >= this.buyPrice(item);
    }

    buy(item: ShopItem) {
        if (!this.canBuy(item)) return;
        this.state.credits -= this.buyPrice(item);
        const upgrade = UPGRADE_FOR[item];
        if (upgrade) {
            this.state.upgrades[upgrade] += 1;
        } else if (item === 'sonicCannon') {
            this.state.hasSonicCannon = true;
        } else if (item === 'emShield') {
            this.state.emShields += 1;
        } else if (item === 'extraLife') {
            this.state.extraLives += 1;
        }
    }

    // A short "what you've got" note shown after the item's name.
    status(item: ShopItem) {
        const upgrade = UPGRADE_FOR[item];
        if (upgrade) return `(Lv ${this.state.upgrades[upgrade]}/${MAX_LEVEL[upgrade]})`;
        if (item === 'emShield' && this.state.emShields > 0) return `(have ${this.state.emShields})`;
        if (item === 'extraLife' && this.state.extraLives > 0) return `(+${this.state.extraLives} next trip)`;
        return '';
    }
}
