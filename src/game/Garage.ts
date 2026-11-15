import { SHIPS, PART_TYPES } from '../config';
import type { PartType, ShipType } from '../config';
import type { GameState } from './GameState';

// The rules of the garage: building ships from parts and choosing which one to fly.
// (StationScene draws the buttons.)
export class Garage {
    constructor(private state: GameState) {}

    owns(ship: ShipType) {
        return this.state.ownedShips.includes(ship);
    }

    isFlying(ship: ShipType) {
        return this.state.activeShip === ship;
    }

    // The parts this ship needs, in the usual part order.
    recipe(ship: ShipType): { part: PartType; need: number; have: number }[] {
        return PART_TYPES
            .filter(part => (SHIPS[ship].recipe[part] ?? 0) > 0)
            .map(part => ({ part, need: SHIPS[ship].recipe[part]!, have: this.state.parts[part] }));
    }

    canBuild(ship: ShipType) {
        return !this.owns(ship) && this.recipe(ship).every(({ need, have }) => have >= need);
    }

    // Uses up the parts and parks the new ship in the garage.
    build(ship: ShipType) {
        if (!this.canBuild(ship)) return;
        for (const { part, need } of this.recipe(ship)) {
            this.state.parts[part] -= need;
        }
        this.state.ownedShips.push(ship);
    }

    fly(ship: ShipType) {
        if (this.owns(ship)) this.state.activeShip = ship;
    }
}
