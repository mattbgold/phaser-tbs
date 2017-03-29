import * as Phaser from 'phaser';
import Game = Phaser.Game;
import {Unit} from "../../../models/unit";
import {BaseUnit} from "../../../game_objects/units/base";
import {GameController, GameEvent} from "../controller";
import {Controller} from "../../interface";
import {InputController} from "../../input/controller";
import {ScoutUnit} from "../../../game_objects/units/scout";

export class UnitController implements Controller {
	constructor(private _ctrl: GameController, private _input: InputController) {
		//subscribe to events
		_ctrl.subscribe(GameEvent.GridCellActivated, _ => {
			//TODO: do summin
			console.log(_);
		});
	}

	init() { }

	update() { }

	createUnit(unit: Unit): BaseUnit {
		let spr = this._ctrl.game.add.isoSprite(unit.x*this._ctrl.config.cellSize, unit.y*this._ctrl.config.cellSize, 0, unit.asset, 0);
		let unitObj = new ScoutUnit(unit, spr);
		return unitObj;
	}

	move(unit: BaseUnit, x, y): void {
		unit.setXPosition(x);
		
		var movementX = this._ctrl.game.add.tween(unit.spr)
			.to({ isoX: x * this._ctrl.config.cellSize }, Math.abs(unit.x - x)*150, Phaser.Easing.Quadratic.InOut);

		movementX.onComplete.add(() => unit.setYPosition(y));

		var movementY = this._ctrl.game.add.tween(unit.spr)
			.to({ isoY: y * this._ctrl.config.cellSize }, Math.abs(unit.y - y)*150, Phaser.Easing.Quadratic.InOut, false, 200);

		movementY.onComplete.add(() => this._ctrl.signals[GameEvent.UnitMoved].dispatch(unit));

		movementX.chain(movementY).start();
	}

	//TODO: we need some kind of TurnExecutor to run the turn in sequence.
	// for the team in action phase, execute the moves and actions one at a time
}