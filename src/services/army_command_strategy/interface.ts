import {BaseUnit} from "../../game_objects/units/base";

export interface IArmyCommandStrategy {
	moveUnit(unitToMove: BaseUnit): void;
}