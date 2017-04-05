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