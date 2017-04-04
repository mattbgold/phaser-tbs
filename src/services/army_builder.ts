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
	private _unitsByPlayer = [];

	//this class is used to build armies in the army selection phase, then used to get the list of units to put into the grid.
	// also used to place units in that begin phase
	constructor(
		private _game: Game,
		@inject('config') private _config: GameConfig) {
		this._loadFromConfig('demo'); //TODO: call this elsewhere
	}

	//todo: in the future, the players army will be built in a menu, but CPU army will load from config
	private _loadFromConfig(mapName) {
		let map = this._config.maps.find(m => m.name === mapName);
		if (!map)
			return console.error(`Could not find map with name: ${mapName}`);

		this._unitsByPlayer = map.armies.map((playerArmy, playerNum) => playerArmy.map(unitName => {
			let model = JSON.parse(JSON.stringify(this._config.units[unitName]));
			model.belongsToPlayer = playerNum;
			return model;
		}));

		let armyIndices = this._unitsByPlayer.map(() => 0);

		for(let yy = 0; yy < map.layout.length; yy++) {
			for(let xx = 0; xx < map.layout.length; xx++) {
				let playerNum = parseInt(map.layout[yy][xx]);
				if(!isNaN(playerNum)) {
					this._unitsByPlayer[playerNum][armyIndices[playerNum]].x = xx;
					this._unitsByPlayer[playerNum][armyIndices[playerNum]].y = yy;
					armyIndices[playerNum]++;
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

	build(): BaseUnit[] {
		let units = this._unitsByPlayer.reduce((a, el) => a.concat(el.map(this._mapToGameObject)), []);

		units.forEach(u => {
			if(u.belongsToPlayer === 0)
				u.spr.scale.x = -1
		});

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

