import {BaseUnit} from "../../../game_objects/units/base";
import {IArmyCommandStrategy} from "../interface";

export interface IArmyCommandStrategyFactory {
	getForPlayer(playerNum: number): IArmyCommandStrategy; 
}