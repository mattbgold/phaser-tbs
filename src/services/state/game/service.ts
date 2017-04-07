import * as Phaser from 'phaser'
import {BaseStateManager} from "../base";
import {injectable} from "inversify";
import {BaseUnit} from "../../../game_objects/units/base";
import {GridCell} from "../../../game_objects/grid/grid_cell";

@injectable()
export class GameStateManager extends BaseStateManager {
	constructor() {
		super();
	}

	units: BaseUnit[];
	cells: GridCell[];
	
	getNumOfPlayers() {
		return this.units.reduce((playerNums, unit) => playerNums.indexOf(unit.belongsToPlayer) > -1 ? playerNums: playerNums.concat(unit.belongsToPlayer), []).length;
	}
}

export enum GameEvent {
	GridCellActivated,
	UnitSelected,
	UnitMoveActionSelected,
	UnitMove,
	UnitMoveCompleted,
	UnitAttackActionSelected,
	UnitAttack,
	UnitAttackCompleted,
	CancelAction,
	TurnStart,
	TurnComplete,
}