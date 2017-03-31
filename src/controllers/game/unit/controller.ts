import * as Phaser from 'phaser';
import Game = Phaser.Game;
import {Unit} from "../../../models/unit";
import {BaseUnit} from "../../../game_objects/units/base";
import {GameController, GameEvent} from "../controller";
import {InputController} from "../../input/controller";
import {ScoutUnit} from "../../../game_objects/units/scout";
import {GridCell} from "../../../game_objects/grid_cell";
import {BaseController} from "../../base";
import {TankUnit} from "../../../game_objects/units/tank";
import {AssaultUnit} from "../../../game_objects/units/assault";

export class UnitController extends BaseController {
	private unitTypeMap: {[key:string]: any} = {
	'scout': ScoutUnit,
	'assault': AssaultUnit,
	'tank': TankUnit
	};

	private _selectedUnit: BaseUnit;
	
	constructor(private _ctrl: GameController, private _input: InputController) {
		super();
	}

	units: BaseUnit[] = [];

	init() {
		this._ctrl.subscribe(GameEvent.GridCellActivated, this._onCellActivated);
		this._ctrl.subscribe(GameEvent.CancelAction, this._onCancelAction);
	}

	update() { }

	loadUnits(units: Unit[]) {
		let xx = 0;

		units.forEach(unit => {
			unit.x = xx++;
			unit.y = 0;
			this._createUnit(unit)
		});
	}
	
	private _createUnit(unit: Unit): BaseUnit {
		let spr = this._ctrl.game.add.isoSprite(unit.x*this._ctrl.config.cellSize, unit.y*this._ctrl.config.cellSize, 0, unit.asset, 0);
		let unitObj = new (this.unitTypeMap[unit.name])(unit, spr);

		this.units.push(unitObj);
		return unitObj;
	}

	move(unit: BaseUnit, x, y): void {
		let skipXAnimation = x === unit.x;
		let skipYAnimation = y === unit.y;

		var movementX = this._ctrl.game.add.tween(unit.spr)
			.to({ isoX: x * this._ctrl.config.cellSize }, Math.abs(unit.x - x)*150, skipYAnimation ? Phaser.Easing.Quadratic.Out : Phaser.Easing.Linear.None);

		movementX.onComplete.add(() => unit.setYPosition(y));

		var movementY = this._ctrl.game.add.tween(unit.spr)
			.to({ isoY: y * this._ctrl.config.cellSize }, Math.abs(unit.y - y)*150, Phaser.Easing.Quadratic.Out);

		movementY.onComplete.add(() => this._ctrl.dispatch(GameEvent.UnitMoved, unit));

		unit.setXPosition(x);

		if(skipXAnimation) {
			unit.setYPosition(y)
			movementY.start();
		} else
			movementX.chain(movementY).start();
		}

	
	// ---------- event handlers ----------
	
	private _onCellActivated = (cell: GridCell): void => {
		let unitAtCell  = this.units.find(unit => unit.x == cell.x && unit.y == cell.y);
		if(!!unitAtCell && this._selectedUnit !== unitAtCell) {
			this._selectedUnit = unitAtCell;
			this._ctrl.dispatch(GameEvent.UnitSelected, unitAtCell);
			
			//TODO: delete me - temporary to test move overlay
			this._ctrl.dispatch(GameEvent.UnitMoveActionSelected, unitAtCell)
		}
	};

	private _onCancelAction = (): void => {
		this._selectedUnit = null;
	}
	
	//TODO: we need some kind of TurnExecutor to run the turn in sequence.
	// for the team in action phase, execute the moves and actions one at a time
}