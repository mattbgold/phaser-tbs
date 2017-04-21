import * as Phaser from 'phaser';
import Game = Phaser.Game;
import {GameSubject, GameEvent} from "../subject/game";
import {BaseUnit} from "../../game_objects/units/base";
import Point3 = Phaser.Plugin.Isometric.Point3;
import {GridCell} from "../../game_objects/grid/grid_cell";
import {IArmyCommandStrategy} from "./interface";

export class DemoArmyCommandStrategy implements IArmyCommandStrategy {
	private _spottedEnemies: BaseUnit[] = [];

	private _delay: number = 100;

	constructor(
		private _playerNum: number, 
		private _myUnits: BaseUnit[],
		private _gameSubject: GameSubject
	) {
		// TODO: how about a base commandStrategy that provides template methods for each event with some basic behavior?
	}

	selectNextUnit() {
		let currentUnit = this._getNextActiveUnit();
		if (!!currentUnit) {
			this._gameSubject.dispatch(GameEvent.GridCellActivated, this._gameSubject.getCellAt(currentUnit));
		}
	}

	moveUnit(unitToMove: BaseUnit) {
		this._findEnemyUnitsInSightRange();

		let openCells = this._gameSubject.cells.filter(x => x.highlighted);

		let targetCell: GridCell = null;

		let unitToAttack: BaseUnit = this._getClosestTo(unitToMove, this._spottedEnemies);

		if(!unitToAttack) {
			targetCell = this._getFurthestFrom(unitToMove, openCells);
		} else { // move to the enemy
			targetCell = this._getClosestTo(unitToAttack, openCells);
		}

		//leave a second with cells highlighted
		this._gameSubject.delayedDispatch(GameEvent.UnitMove, targetCell, this._delay);
	}

	attackWithUnit(unit: BaseUnit) {
		this._gameSubject.dispatch(GameEvent.UnitAttackActionSelected, unit);

		let unitToAttack: BaseUnit;

		do {
			//find a unit that we can deal damage to
			unitToAttack = this._getClosestTo(unit, this._spottedEnemies);
			this._spottedEnemies.splice(this._spottedEnemies.indexOf(unitToAttack), 1);
		} while (!!unitToAttack && unit.stats.attack - unitToAttack.stats.armor <= 0);

		if(unitToAttack && this._gameSubject.getCellAt(unitToAttack).highlighted)
			this._gameSubject.delayedDispatch(GameEvent.UnitAttack, unitToAttack, this._delay);
		else {
			this._gameSubject.dispatch(GameEvent.UnitWaitActionSelected, unit);
		}
	}

	get livingUnits() {
		return this._myUnits.filter(x => x.isDead === false);
	}

	private _findEnemyUnitsInSightRange() {
		let enemyUnits = this._gameSubject.units.filter(x => x.belongsToPlayer !== this._playerNum && !x.isDead);
		this._spottedEnemies = [];

		for(let i = 0; i < enemyUnits.length; i++) {
			let enemy = enemyUnits[i];

			for(let j = 0; j < this.livingUnits.length; j++) {
				let myUnit = this.livingUnits[j];
				if(myUnit.stats.sight >= this._distanceFrom(myUnit, enemy)) {
					this._spottedEnemies.push(enemy);
					break;
				}
			}
		}
	}

	private _getNextActiveUnit() {
		return this.livingUnits.find(u => !u.hasActedThisTurn);
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