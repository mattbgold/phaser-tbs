import * as Phaser from 'phaser';
import {IArmyCommandStrategy} from "./interface";
import {GameController} from "../../controllers/game/controller";
import Game = Phaser.Game;
import {GameStateManager, GameEvent} from "../state/game/service";
import {BaseUnit} from "../../game_objects/units/base";
import {InputStateManager, InputEvent} from "../state/input/service";
import Point3 = Phaser.Plugin.Isometric.Point3;
import {GameConfig} from "../../config";
import {GridCell} from "../../game_objects/grid/grid_cell";

export class DemoArmyCommandStrategy implements IArmyCommandStrategy {

	private _myUnits: BaseUnit[];

	private _spottedEnemies: BaseUnit[] = [];

	private _delay: number = 200;

	constructor(
		private _playerNum: number, 
		private _gameState: GameStateManager,
	    private _inputState: InputStateManager,
	    private _config: GameConfig
	) {
		this._myUnits = this._gameState.units.filter(u => u.belongsToPlayer === this._playerNum);

		//TODO: how about a base commandStrategy that provides template methods for each event with some basic behavior?

		this._gameState.subscribe(GameEvent.TurnStart, playerNum => this.selectNextUnit(playerNum));
		this._gameState.subscribe(GameEvent.UnitMoveActionSelected, unit => this.moveUnit(unit));
		this._gameState.subscribe(GameEvent.UnitMoveCompleted, unit => this.beginAttack(unit));
		this._gameState.subscribe(GameEvent.UnitAttackActionSelected, unit => this.attackWithUnit(unit));
		this._gameState.subscribe(GameEvent.UnitAttackCompleted, unit => this.selectNextUnit(unit.belongsToPlayer));
	}

	selectNextUnit(currentPlayer: number) {
		if (currentPlayer !== this._playerNum)
			return;

		let currentUnit = this._getNextActiveUnit();
		if (!!currentUnit)
			this._tapLocation(currentUnit);
		else {
			//TODO: do this somewhere else, like turn executor (currently AIController).
			this._myUnits.forEach(u => u.hasMovedThisTurn = false);
			this._gameState.dispatch(GameEvent.TurnComplete, this._playerNum);
		}
	}

	moveUnit(unitToMove: BaseUnit) {
		if (unitToMove.belongsToPlayer !== this._playerNum)
			return;

		this._findEnemyUnitsInSightRange();

		let openCells = this._gameState.cells.filter(x => x.highlighted);

		let targetCell: GridCell = null;

		let unitToAttack: BaseUnit = this._getClosestTo(unitToMove, this._spottedEnemies);

		if(!unitToAttack) {
			targetCell = this._getFurthestFrom(unitToMove, openCells);
		} else { // move to the enemy
			targetCell = this._getClosestTo(unitToAttack, openCells);
		}

		unitToMove.hasMovedThisTurn = true; //TODO: this should be set by unitController on moveComplete!

		//leave a second with cells highlighted
		setTimeout(() => this._tapLocation(targetCell), this._delay);
	}

	beginAttack(unit: BaseUnit) {
		if (unit.belongsToPlayer !== this._playerNum)
			return;


		this._tapLocation(unit);
		this._gameState.dispatch(GameEvent.UnitAttackActionSelected, unit);
	}

	attackWithUnit(unit: BaseUnit) {
		if (unit.belongsToPlayer !== this._playerNum)
			return;

		let unitToAttack: BaseUnit;

		do {
			//find a unit that we can deal damage to
			unitToAttack = this._getClosestTo(unit, this._spottedEnemies);
			this._spottedEnemies.splice(this._spottedEnemies.indexOf(unitToAttack), 1);
		} while (!!unitToAttack && unit.stats.attack - unitToAttack.stats.armor <= 0);

		if(unitToAttack && this._cellUnderUnit(unitToAttack).highlighted)
			setTimeout(() => this._tapLocation(unitToAttack), this._delay); //this._gameState.dispatch(GameEvent.UnitAttack, unitToAttack)
		else {
			this._gameState.dispatch(GameEvent.CancelAction);
			this._gameState.dispatch(GameEvent.UnitAttackCompleted, unit);
		}
	}

	get livingUnits() {
		return this._myUnits.filter(x => x.isDead === false);
	}


	private _findEnemyUnitsInSightRange() {
		let enemyUnits = this._gameState.units.filter(x => x.belongsToPlayer !== this._playerNum && !x.isDead);
		this._spottedEnemies = [];

		let myUnits = this.livingUnits;

		for(let i in enemyUnits) {
			let enemy = enemyUnits[i];

			for(var j in myUnits) {
				let unit = myUnits[j];
				if(unit.stats.range <= this._distanceFrom(unit, enemy)) {
					this._spottedEnemies.push(enemy);
					break;
				}
			}
		}
	}

	private _getNextActiveUnit() {
		return this.livingUnits.find(u => u.hasMovedThisTurn === false);
	}

	private _tapLocation(loc: BaseUnit | GridCell) {
		this._inputState.dispatch(InputEvent.Tap, new Point3(loc.x * this._config.cellSize, loc.y * this._config.cellSize))
	}

	private _cellUnderUnit(unit: BaseUnit) {
		return this._gameState.cells.find(c => c.x === unit.x && c.y === unit.y);
	}

	private _distanceFrom<T>(unit: BaseUnit, loc: T): number {
		return Math.abs(unit.x - loc['x']) + Math.abs(unit.y - loc['y']);
	}

	private _getClosestTo<T>(unit: BaseUnit, options: T[], getFurthest: boolean = false): T {
		return options.reduce((closestSoFar: T, current: T) => {
			if(!closestSoFar)
				return current;

			let distanceFromCurrentEnemy = this._distanceFrom(unit, current);
			let distanceFromClosestEnemy = this._distanceFrom(unit, closestSoFar);

			if(!getFurthest && distanceFromCurrentEnemy < distanceFromClosestEnemy) {
				return current;
			}
			if(getFurthest && distanceFromCurrentEnemy > distanceFromClosestEnemy) {
				return current;
			}

			if (distanceFromCurrentEnemy === distanceFromClosestEnemy) {
				return Math.random() < .5 ? closestSoFar : current;
			}

			return closestSoFar;
		}, null);
	}

	private _getFurthestFrom<T>(unit: BaseUnit, options: T[]) {
		return this._getClosestTo(unit, options, true);
	}
}