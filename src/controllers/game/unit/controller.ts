import * as Phaser from 'phaser';
import {injectable} from "inversify";
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


@injectable()
export class UnitController extends BaseController {
	private unitTypeMap: {[key:string]: any} = {
	'scout': ScoutUnit,
	'assault': AssaultUnit,
	'tank': TankUnit
	};

	private _selectedUnit: BaseUnit;
	private _deadUnits: BaseUnit[] = [];

	constructor(private _ctrl: GameController, private _input: InputController) {
		super();
		this.units = [];
		_ctrl.set('units', this.units);
	}

	units: BaseUnit[];

	init() {
		this._ctrl.subscribe(GameEvent.GridCellActivated, this._onCellActivated);
		this._ctrl.subscribe(GameEvent.CancelAction, this._onCancelAction);
		this._ctrl.subscribe(GameEvent.UnitMove, this._onUnitMove);
		this._ctrl.subscribe(GameEvent.UnitAttack, this._onUnitAttack);
	}

	update() { }

	render() {
		if(!!this._selectedUnit) {
			this._ctrl.game.debug.text(`${this._selectedUnit.name} HP: ${this._selectedUnit.hp}`, 2, 34, "#a7aebe");
			this._ctrl.game.debug.text('Base Unit Stats:' + JSON.stringify(this._selectedUnit.stats), 2, 54, "#a7aebe");
		}
	}
	
	loadUnits(units: Unit[]) {
		let xx = 0;

		units.forEach(unit => {
			unit.x = xx++;
			unit.y = 0;
			this._createUnit(unit)
		});
	}

	// ------------------------------------
	// ---------- EVENT HANDLERS ----------
	// ------------------------------------
	
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
	};

	private _onUnitMove = (cell: GridCell): void => {
		this._moveUnit(this._selectedUnit, cell.x, cell.y);
	};
	
	private _onUnitAttack = (defendingUnit: BaseUnit): void => {
		if (!this._selectedUnit)
			console.error('Cannot attack, no unit selected!', defendingUnit);
		
		this._handleCombat(this._selectedUnit, defendingUnit);
	};
	
	// ---------------------------------------
	// ---------- HELPER FUNCTIONS  ----------
	// ---------------------------------------

	private _moveUnit(unit: BaseUnit, x, y): void {
		let skipXAnimation = x === unit.x;

		var movementX = this._ctrl.game.add.tween(unit.spr)
			.to({ isoX: x * this._ctrl.config.cellSize }, Math.abs(unit.x - x)*150, Phaser.Easing.Linear.None);

		movementX.onComplete.add(() => unit.setYPosition(y));

		var movementY = this._ctrl.game.add.tween(unit.spr)
			.to({ isoY: y * this._ctrl.config.cellSize }, Math.abs(unit.y - y)*150, Phaser.Easing.Linear.None);

		movementY.onComplete.add(() => this._ctrl.dispatch(GameEvent.UnitMoveCompleted, unit));

		unit.setXPosition(x);

		if(skipXAnimation) {
			unit.setYPosition(y)
			movementY.start();
		} else {
			movementX.chain(movementY).start();
		}
	}

	private _handleCombat(attackingUnit: BaseUnit, defendingUnit: BaseUnit): void {
		let damage = attackingUnit.stats.attack - defendingUnit.stats.armor;

		//face each other
		attackingUnit.pointToUnit(defendingUnit);
		defendingUnit.pointToUnit(attackingUnit);

		let attackerAnimation = this._ctrl.game.add.tween(attackingUnit.spr).to({isoX:attackingUnit.spr.isoX + 2}, 50, Phaser.Easing.Elastic.InOut, true, 0, 4, true);
		if (damage) {
			let defenderAnimation = this._ctrl.game.add.tween(defendingUnit.spr).to({}, 50, null, true, 0, 10);
			defenderAnimation.onRepeat.add(() => defendingUnit.spr.tint = defendingUnit.spr.tint === 0xff0000 ? 0xffffff : 0xff0000);
		}
		
		attackerAnimation.onComplete.add(() => {
			if(!damage) return;

			defendingUnit.hp -= damage;

			if(defendingUnit.isDead) {
				this._deadUnits.push(this.units.splice(this.units.indexOf(defendingUnit), 1)[0]);

				//TODO: remove this later
				let explosion = this._ctrl.game.add.sprite(defendingUnit.spr.x, defendingUnit.spr.y, 'explosion');
				explosion.anchor.set(.5, .5);
				explosion.scale.set(.5, .5);
				explosion.animations.add('explode');
				explosion.animations.play('explode', 30, false, true);
				defendingUnit.spr.kill();
			}
		});
	}
	
	private _createUnit(unit: Unit): BaseUnit {
		let spr = this._ctrl.game.add.isoSprite(unit.x*this._ctrl.config.cellSize, unit.y*this._ctrl.config.cellSize, 0, unit.asset, 0);
		let unitObj = new (this.unitTypeMap[unit.name])(unit, spr);

		this.units.push(unitObj);
		return unitObj;
	}
	//TODO: we need some kind of TurnExecutor to run the turn in sequence.
	// for the team in action phase, execute the moves and actions one at a time
}