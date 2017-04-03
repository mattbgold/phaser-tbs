import * as Phaser from 'phaser';
import {injectable, inject} from "inversify";
import Game = Phaser.Game;
import {BaseUnit} from "../../../game_objects/units/base";
import {GameController, GameEvent} from "../controller";
import {InputController} from "../../input/controller";
import {GridCell} from "../../../game_objects/grid/grid_cell";
import {BaseController} from "../../base";
import Tween = Phaser.Tween;
import {GameConfig} from "../../../config";
import {ArmyBuilder} from "../../../services/army_builder";


@injectable()
export class UnitController extends BaseController {
	private _selectedUnit: BaseUnit;
	private _deadUnits: BaseUnit[] = [];

	constructor(
		private _game: Game, 
		private _ctrl: GameController, 
		private _input: InputController, 
		@inject('config') private _config: GameConfig,
	    private _armyBuilder: ArmyBuilder
	) {
		super();
	}

	units: BaseUnit[];

	init() {
		this._ctrl.subscribe(GameEvent.GridCellActivated, this._onCellActivated);
		this._ctrl.subscribe(GameEvent.CancelAction, this._onCancelAction);
		this._ctrl.subscribe(GameEvent.UnitMove, this._onUnitMove);
		this._ctrl.subscribe(GameEvent.UnitAttack, this._onUnitAttack);
		
		this.units = this._armyBuilder.build(1);
		this.units = this.units.concat(this._armyBuilder.build(2));
		this._ctrl.set('units', this.units);
	}

	update() { }

	render() {
		if(!!this._selectedUnit) {
			this._game.debug.text(`${this._selectedUnit.name} HP: ${this._selectedUnit.hp}`, 2, 34, "#a7aebe");
			this._game.debug.text('Base Unit Stats:' + JSON.stringify(this._selectedUnit.stats), 2, 54, "#a7aebe");
		}
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
		this._moveUnit(this._selectedUnit, cell);
	};
	
	private _onUnitAttack = (defendingUnit: BaseUnit): void => {
		if (!this._selectedUnit)
			console.error('Cannot attack, no unit selected!', defendingUnit);
		
		this._handleCombat(this._selectedUnit, defendingUnit);
	};
	
	// ---------------------------------------
	// ---------- HELPER FUNCTIONS  ----------
	// ---------------------------------------

	private _moveUnit(unit: BaseUnit, targetCell: GridCell): void {
		let path = targetCell.pathFromActiveCell;

		let tween = this._game.add.tween(unit.spr);
		let xx = unit.x;
		let yy = unit.y;

		let xPos = [unit.x];
		let yPos = [unit.y];

		for(let i in path) {
			switch(path[i]) {
				case 'up':
					yPos.push(--yy);
					xPos.push(xx);
					tween.to({ isoY: (yy) * this._config.cellSize }, 150, Phaser.Easing.Linear.None);
					break;
				case 'down':
					yPos.push(++yy);
					xPos.push(xx);
					tween.to({ isoY: (yy) * this._config.cellSize }, 150, Phaser.Easing.Linear.None);
					break;
				case 'left':
					xPos.push(--xx);
					yPos.push(yy);
					tween.to({ isoX: (xx) * this._config.cellSize }, 150, Phaser.Easing.Linear.None);
					break;
				case 'right':
					xPos.push(++xx);
					yPos.push(yy);
					tween.to({ isoX: (xx) * this._config.cellSize }, 150, Phaser.Easing.Linear.None);
					break;
				default:
					console.error('Invalid path');
			}
		}

		let posIndex = 1;
		tween.onChildComplete.add((a,b) => {
			if(posIndex >= xPos.length) return;
			posIndex++;
			unit.setXPosition(xPos[posIndex]);
			unit.setYPosition(yPos[posIndex]);
		});
		unit.setXPosition(xPos[1]);
		unit.setYPosition(yPos[1]);
		tween.onComplete.add(() => this._ctrl.dispatch(GameEvent.UnitMoveCompleted, unit));
		tween.start();
	}

	private _handleCombat(attackingUnit: BaseUnit, defendingUnit: BaseUnit): void {
		let damage = attackingUnit.stats.attack - defendingUnit.stats.armor;

		//face each other
		attackingUnit.pointToUnit(defendingUnit);
		defendingUnit.pointToUnit(attackingUnit);

		let attackerAnimation = this._game.add.tween(attackingUnit.spr).to({isoX:attackingUnit.spr.isoX + 2}, 50, Phaser.Easing.Elastic.InOut, true, 0, 4, true);
		if (damage) {
			this._game.time.events.repeat(50, 10, () => defendingUnit.spr.tint = defendingUnit.spr.tint === 0xff0000 ? 0xffffff : 0xff0000);
		}

		attackerAnimation.onComplete.add(() => {
			if(!damage) return;

			defendingUnit.hp -= damage;

			if(defendingUnit.isDead) {
				this._deadUnits.push(this.units.splice(this.units.indexOf(defendingUnit), 1)[0]);

				//TODO: remove this later
				let explosion = this._game.add.sprite(defendingUnit.spr.x, defendingUnit.spr.y, 'explosion');
				explosion.anchor.set(.5, .5);
				explosion.scale.set(.5, .5);
				explosion.animations.add('explode');
				explosion.animations.play('explode', 30, false, true);
				defendingUnit.spr.kill();
			}
		});
	}

	//TODO: delete me at some point
	// private _createUnit(unit: Unit): BaseUnit {
	// 	let spr = this._game.add.isoSprite(unit.x*this._config.cellSize, unit.y*this._config.cellSize, 0, unit.asset, 0);
	// 	let unitObj = new (this.unitTypeMap[unit.name])(unit, spr);
	//
	// 	this.units.push(unitObj);
	// 	return unitObj;
	// }
	//TODO: we need some kind of TurnExecutor to run the turn in sequence.
	// for the team in action phase, execute the moves and actions one at a time
}