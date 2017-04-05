import * as Phase from 'phaser'
import {BaseStateManager} from "../base";
import {injectable} from "inversify";

@injectable()
export class GameStateManager extends BaseStateManager {
	constructor() {
		super();
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