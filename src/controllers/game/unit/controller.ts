import * as Phaser from 'phaser';
import Game = Phaser.Game;
import {Unit} from "../../../models/unit";
import {BaseUnit} from "../../../game_objects/units/base";
import {GameController, GameEvent} from "../controller";
import {InputController} from "../../input/controller";
import {ScoutUnit} from "../../../game_objects/units/scout";
import {GridCell} from "../../../game_objects/grid_cell";
import {BaseController} from "../../base";

export class UnitController extends BaseController {
	constructor(private _ctrl: GameController, private _input: InputController) {
		super();
	}

	units: BaseUnit[] = [];

	init() { 
		this._ctrl.subscribe(GameEvent.GridCellActivated, this._onCellActivated);
	}

	update() { }

	createUnit(unit: Unit): BaseUnit {
		let spr = this._ctrl.game.add.isoSprite(unit.x*this._ctrl.config.cellSize, unit.y*this._ctrl.config.cellSize, 0, unit.asset, 0);
		let unitObj = new ScoutUnit(unit, spr);

		this.units.push(unitObj);
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

	private _onCellActivated = (cell: GridCell): void => {
		let unitSelected  = this.units.find(unit => unit.x == cell.x && unit.y == cell.y);
		if(!!unitSelected) {
			this._ctrl.signals[GameEvent.UnitSelected].dispatch(unitSelected);
		}
	}
	//TODO: we need some kind of TurnExecutor to run the turn in sequence.
	// for the team in action phase, execute the moves and actions one at a time
}