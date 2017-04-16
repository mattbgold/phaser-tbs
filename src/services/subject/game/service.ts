import * as Phaser from 'phaser'
import {BaseSubject} from "../base";
import {injectable} from "inversify";
import {BaseUnit} from "../../../game_objects/units/base";
import {GridCell} from "../../../game_objects/grid/grid_cell";

@injectable()
export class GameSubject extends BaseSubject {
	constructor() {
		super();
	}

	units: BaseUnit[];
	cells: GridCell[];
	
	numberOfPlayers: number;
	
	getCellAt(unit: BaseUnit): GridCell {
		return this.cells.find(c => c.x === unit.x && c.y === unit.y);
	}

	getUnitAt(cell: GridCell): BaseUnit {
		return this.units.find(u => u.x === cell.x && u.y === cell.y);
	}
}