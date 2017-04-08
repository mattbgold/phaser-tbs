import {IArmyCommandStrategy} from "../interface";

export interface IArmyCommandStrategyFactory {
	create(playerNum: number): IArmyCommandStrategy; 
}