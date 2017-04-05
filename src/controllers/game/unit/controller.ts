import * as Phaser from 'phaser';
import {injectable, inject} from "inversify";
import {BaseUnit} from "../../../game_objects/units/base";
import {GridCell} from "../../../game_objects/grid/grid_cell";
import {BaseController} from "../../base";
import {GameConfig} from "../../../config";
import {IMapBuilder} from "../../../services/map_builder/interface";
import {GameStateManager, GameEvent} from "../../../services/state/game/service";
import Game = Phaser.Game;
import Tween = Phaser.Tween;

@injectable()
export class UnitController extends BaseController {
	private _selectedUnit: BaseUnit;
	private _deadUnits: BaseUnit[] = [];

	constructor(
		private _game: Game,
		@inject('gameState') private _gameState: GameStateManager,
		@inject('config') private _config: GameConfig,
		@inject('IMapBuilder') private _mapBuilder: IMapBuilder
	) {
		super();
	}

	units: BaseUnit[];

	init() {
		this._gameState.subscribe(GameEvent.GridCellActivated, this._onCellActivated);
		this._gameState.subscribe(GameEvent.CancelAction, this._onCancelAction);
		this._gameState.subscribe(GameEvent.UnitMove, this._onUnitMove);
		this._gameState.subscribe(GameEvent.UnitAttack, this._onUnitAttack);
		
		this.units = this._mapBuilder.buildUnits();
		this._gameState.set('units', this.units);
	}

	update() {
		this._game.iso.simpleSort(this._game['isoUnitsGroup']);
	}

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
			this._gameState.dispatch(GameEvent.UnitSelected, unitAtCell);
			
			//TODO: delete me - temporary to test move overlay
			this._gameState.dispatch(GameEvent.UnitMoveActionSelected, unitAtCell)
		}
	};

	private _onCancelAction = (): void => {
		this._selectedUnit = null;
	};

	private _onUnitMove = (destinationCell: GridCell): void => {
		if(!destinationCell)
			return;
		
		this._moveUnit(this._selectedUnit, destinationCell)
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
		tween.onComplete.add(() => this._gameState.dispatch(GameEvent.UnitMoveCompleted, unit));
		tween.start();
	}

	private _handleCombat(attackingUnit: BaseUnit, defendingUnit: BaseUnit): void {
		let damage = attackingUnit.stats.attack - defendingUnit.stats.armor;

		// make units face each other when attacking
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

	//TODO: we need some kind of TurnExecutor to run the turn in sequence.
	// for the team in action phase, execute the moves and actions one at a time
}