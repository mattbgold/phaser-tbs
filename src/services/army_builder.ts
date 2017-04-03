import {Unit} from "../models/unit";
import {GameConfig} from "../config";
import * as Phaser from 'phaser';
import Game = Phaser.Game;
import {injectable, inject} from "inversify";
import {ScoutUnit} from "../game_objects/units/scout";
import {AssaultUnit} from "../game_objects/units/assault";
import {TankUnit} from "../game_objects/units/tank";
import {BaseUnit} from "../game_objects/units/base";

@injectable()
export class ArmyBuilder {
	private _army1Units: Unit[] = [];
	private _army2Units: Unit[] = [];

	//this class is used to build armies in the army selection phase, then used to get the list of units to put into the grid.
	// also used to place units in that begin phase
	constructor(
		private _game: Game,
		@inject('config') private _config: GameConfig) {
		this._loadFromConfig();
	}

	//todo: in the future, the players army will be built in a menu, but CPU army will load from config
	private _loadFromConfig() {
		let army1Index = 0, army2Index = 0;
		this._army1Units = this._config.army1.map(name => JSON.parse(JSON.stringify(this._config.units[name])));
		this._army2Units = this._config.army2.map(name => JSON.parse(JSON.stringify(this._config.units[name])));

		for(let yy = 0; yy < this._config.map.length; yy++) {
			for(let xx = 0; xx < this._config.map.length; xx++) {
				if(this._config.map[yy][xx] === '1') {
					this._army1Units[army1Index].x = xx;
					this._army1Units[army1Index++].y = yy;
				}
				else if(this._config.map[yy][xx] === '2') {
					this._army2Units[army2Index].x = xx;
					this._army2Units[army2Index++].y = yy;
				}
			}
		}
	}

	// add(unit: Unit) {
	// 	this._units.push(unit);
	// }
	//
	// remove(unit: Unit) {
	// 	this._units.splice(this._units.map(x => x.name).indexOf(unit.name), 1);
	// }
	//
	// getList(): Unit[] {
	// 	return this._units;
	// }

	build(armyNum: number): BaseUnit[] {
		let units: BaseUnit[];
		if(armyNum === 2) {
			units = this._army2Units.map(this._mapToGameObject);
		} else {
			units = this._army1Units.map(this._mapToGameObject);
			units.forEach(u => u.spr.scale.x = -1);
		}
		return units;
	}

	private _mapToGameObject = (unit: Unit): BaseUnit => {
		let spr = this._game.add.isoSprite(unit.x * this._config.cellSize, unit.y * this._config.cellSize, 0, unit.asset, 0, this._game['isoUnitsGroup']);

		spr.anchor.set(0.5, 0.3);
		return new (this._unitTypeMap[unit.name])(unit, spr);
	}
	
	private _unitTypeMap: {[key:string]: any} = {
		'scout': ScoutUnit,
		'assault': AssaultUnit,
		'tank': TankUnit
	};
}

