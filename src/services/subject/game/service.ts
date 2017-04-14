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
}

export enum GameEvent {
	LoadMap,
	LoadMapCompleted,
	UnitsInitialized,
	GridCellActivated,
	UnitSelected,
	UnitWaitActionSelected,
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