import {BaseUnit} from "../../game_objects/units/base";

export interface IArmyCommandStrategy {
	selectNextUnit(): void;
	moveUnit(unitToMove: BaseUnit): void;
	attackWithUnit(unit: BaseUnit): void;
}