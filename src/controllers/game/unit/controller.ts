import * as Phaser from 'phaser';
import {injectable, inject} from "inversify";
import {BaseUnit} from "../../../game_objects/units/base";
import {GridCell} from "../../../game_objects/grid/grid_cell";
import {BaseController} from "../../base";
import {GameConfig} from "../../../config";
import {IMapBuilder} from "../../../services/map_builder/interface";
import {GameSubject, GameEvent} from "../../../services/subject/game/service";
import Game = Phaser.Game;
import Tween = Phaser.Tween;
import {ContainerKeys} from "../../../inversify.config";

@injectable()
export class UnitController extends BaseController {
	private _selectedUnit: BaseUnit;
	private _deadUnits: BaseUnit[] = [];

	constructor(
		private _game: Game,
		private _gameSubject: GameSubject,
		@inject(ContainerKeys.CONFIG) private _config: GameConfig,
		@inject(ContainerKeys.MAP_BUILDER) private _mapBuilder: IMapBuilder
	) {
		super();
	}

	units: BaseUnit[];

	preload() {
		this._gameSubject.subscribe(GameEvent.LoadMapCompleted, this._initializeUnits);
		this._gameSubject.subscribe(GameEvent.GridCellActivated, this._trySelectUnit);
		this._gameSubject.subscribe(GameEvent.CancelAction, this._deselectUnit);
		this._gameSubject.subscribe(GameEvent.UnitWaitActionSelected, this._unitFinishedTurn);
		this._gameSubject.subscribe(GameEvent.UnitMove, this._tryMoveUnit);
		this._gameSubject.subscribe(GameEvent.UnitMoveCompleted, this._flagUnitAsMoved);
		this._gameSubject.subscribe(GameEvent.UnitAttack, this._tryAttackWithUnit);
		this._gameSubject.subscribe(GameEvent.UnitAttackCompleted, this._unitFinishedTurn);
		this._gameSubject.subscribe(GameEvent.TurnComplete, this._resetUnits);
	}
	
	create() {
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
	private _initializeUnits = (): void => {
		this.units = this._mapBuilder.buildUnits();
		this._gameSubject.units = this.units;

		this._gameSubject.dispatch(GameEvent.UnitsInitialized);
	};
	
	private _trySelectUnit = (cell: GridCell): void => {
		let unitAtCell  = this.units.find(unit => unit.x == cell.x && unit.y == cell.y);
		if(!!unitAtCell && this._selectedUnit !== unitAtCell) {
			this._selectedUnit = unitAtCell;
			this._gameSubject.dispatch(GameEvent.UnitSelected, unitAtCell);
			
			//TODO: delete me - temporary to test move overlay
			if(!unitAtCell.hasMovedThisTurn)
				this._gameSubject.dispatch(GameEvent.UnitMoveActionSelected, unitAtCell)
		}
	};

	private _deselectUnit = (): void => {
		this._selectedUnit = null;
	};
	
	private _tryMoveUnit = (destinationCell: GridCell): void => {
		if(!destinationCell)
			return;
		
		this._moveUnit(this._selectedUnit, destinationCell)
	};

	private _flagUnitAsMoved = (unit: BaseUnit): void => {
		unit.hasMovedThisTurn = true;	
	};
	
	private _tryAttackWithUnit = (defendingUnit: BaseUnit): void => {
		if (!this._selectedUnit)
			console.error('Cannot attack, no unit selected!', defendingUnit);
		
		this._handleCombat(this._selectedUnit, defendingUnit);
	};

	private _resetUnits = (playerNum: number): void => {
		this.units.filter(u => u.belongsToPlayer === playerNum).forEach(u => {
			u.hasMovedThisTurn = false;
			u.hasActedThisTurn = false;
			u.setTint(0xffffff);
		});
	};

	// ---------------------------------------
	// ---------- HELPER FUNCTIONS  ----------
	// ---------------------------------------

	private _unitFinishedTurn = (unit: BaseUnit): void => {
		unit.hasActedThisTurn = true;
		unit.setTint(0xaaaaaa);

		let unitsForPlayer = this.units.filter(x => x.belongsToPlayer === unit.belongsToPlayer && !x.isDead);

		if(unitsForPlayer.every(x => x.hasActedThisTurn))
			this._gameSubject.delayedDispatch(GameEvent.TurnComplete, unit.belongsToPlayer, 1); //HACK: let other subscriptions finish first before we dispatch turn completion
	};

	private _moveUnit(unit: BaseUnit, targetCell: GridCell): void {
		let path = targetCell.pathFromActiveCell;

		let tween = this._game.add.tween(unit.spr);
		let xx = unit.x;
		let yy = unit.y;

		let xPos = [unit.x];
		let yPos = [unit.y];

		let time = 100;
		
		for(let i in path) {
			switch(path[i]) {
				case 'up':
					yPos.push(--yy);
					xPos.push(xx);
					tween.to({ isoY: (yy) * this._config.cellSize }, time, Phaser.Easing.Linear.None);
					break;
				case 'down':
					yPos.push(++yy);
					xPos.push(xx);
					tween.to({ isoY: (yy) * this._config.cellSize }, time, Phaser.Easing.Linear.None);
					break;
				case 'left':
					xPos.push(--xx);
					yPos.push(yy);
					tween.to({ isoX: (xx) * this._config.cellSize }, time, Phaser.Easing.Linear.None);
					break;
				case 'right':
					xPos.push(++xx);
					yPos.push(yy);
					tween.to({ isoX: (xx) * this._config.cellSize }, time, Phaser.Easing.Linear.None);
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
		tween.onComplete.add(() => this._gameSubject.dispatch(GameEvent.UnitMoveCompleted, unit));
		tween.start();
	}

	private _handleCombat(attackingUnit: BaseUnit, defendingUnit: BaseUnit): void {
		let damage = attackingUnit.stats.attack - defendingUnit.stats.armor;

		// make units face each other when attacking
		attackingUnit.pointToUnit(defendingUnit);
		defendingUnit.pointToUnit(attackingUnit);

		let attackerAnimation = this._game.add.tween(attackingUnit.spr).to({isoX:attackingUnit.spr.isoX + 2}, 50, Phaser.Easing.Elastic.InOut, true, 0, 4, true);
		if (damage) {
			this._game.time.events.repeat(50, 10, () => defendingUnit.spr.tint = defendingUnit.spr.tint === 0xff0000 ? defendingUnit.currentTint : 0xff0000);
		}

		attackerAnimation.onComplete.add(() => {
			if(damage) {
				defendingUnit.hp -= damage;

				if (defendingUnit.isDead) {
					this._deadUnits.push(this.units.splice(this.units.indexOf(defendingUnit), 1)[0]);
					defendingUnit.x = -1;
					defendingUnit.y = -1;

					//TODO: remove this later
					let explosion = this._game.add.sprite(defendingUnit.spr.x, defendingUnit.spr.y, 'explosion');
					explosion.anchor.set(.5, .5);
					explosion.scale.set(.5, .5);
					explosion.animations.add('explode');
					explosion.animations.play('explode', 30, false, true);
					defendingUnit.spr.kill();
				}
			}
			this._gameSubject.dispatch(GameEvent.UnitAttackCompleted, attackingUnit);
		});
	}

	//TODO: we need some kind of TurnExecutor to run the turn in sequence.
	// for the team in action phase, execute the moves and actions one at a time
}