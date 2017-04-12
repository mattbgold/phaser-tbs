import {GridCell} from "../../game_objects/grid/grid_cell";
import {BaseUnit} from "../../game_objects/units/base";

export interface IMapBuilder {
	load(mapName: string): void;
	getNumOfPlayers(): number;
	buildUnits(): BaseUnit[];
	buildGrid(): GridCell[];
}