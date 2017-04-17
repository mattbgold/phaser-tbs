import * as Phaser from 'phaser';
import {IMapBuilder} from "./interface";
import {GridCell} from "../../game_objects/grid/grid_cell";
import {inject, injectable} from "inversify";
import {GameConfig} from "../../config";
import Game = Phaser.Game;
import {BaseUnit} from "../../game_objects/units/base";
import {Unit} from "../../models/unit";
import {ScoutUnit} from "../../game_objects/units/scout";
import {AssaultUnit} from "../../game_objects/units/assault";
import {TankUnit} from "../../game_objects/units/tank";
import {WaterCell} from "../../game_objects/grid/water";
import {MountainCell} from "../../game_objects/grid/mountain";
import {BridgeCell} from "../../game_objects/grid/bridge";
import {MapLayout} from "../../models/map_layout";
import {Cell} from "../../models/cell";

@injectable()
export class MapBuilder implements IMapBuilder {
	private _unitsByPlayer = [];
	private _map: MapLayout;

	private _unitTypeMap: {[key:string]: any} = {
		'scout': ScoutUnit,
		'assault': AssaultUnit,
		'tank': TankUnit
	};

	private _cellTypeMap: {[key:string]: any} = {
		'W': WaterCell,
		'M': MountainCell,
		'B': BridgeCell
	};

	constructor(
		private _game: Game,
		 @inject('config') private _config: GameConfig
	) { }

	load(mapName: string): void {
		this._map = this._config.maps.find(m => m.name === mapName);
		
		if (!this._map)
			return console.error(`Could not find map with name: ${mapName}`);

		this._unitsByPlayer = this._map.armies.map((playerArmy, playerNum) => playerArmy.map(unitName => {
			let model = JSON.parse(JSON.stringify(this._config.units[unitName]));
			model.belongsToPlayer = playerNum;
			return model;
		}));

		let armyIndices = this._unitsByPlayer.map(() => 0);

		for(let yy = 0; yy < this._map.layout.length; yy++) {
			for(let xx = 0; xx < this._map.layout.length; xx++) {
				let playerNum = parseInt(this._map.layout[yy][xx]);
				if(!isNaN(playerNum)) {
					let unit = this._unitsByPlayer[playerNum][armyIndices[playerNum]];
					unit.x = xx;
					unit.y = yy;
					armyIndices[playerNum]++;
				}
			}
		}
	}

	getNumOfPlayers(): number {
		return this._unitsByPlayer.length;
	}
	
	buildUnits(): BaseUnit[] {
		let units = this._unitsByPlayer.reduce((allUnits, playerArmy) => allUnits.concat(playerArmy.map(this._mapToBaseUnit)), []);

		units.forEach(u => {
			if(u.belongsToPlayer === 0) //TODO: eventually we should use position in map to determine
				u.spr.scale.x = -1
		});

		return units;
	}

	buildGrid(): GridCell[] {
		let mapLayout: string[][] = this._map.layout;
		let cells: GridCell[] = [];

		for (let xx = 0; xx < mapLayout[0].length; xx++) {
			for (let yy = 0; yy < mapLayout.length; yy++) {
				let cellConfig = this._config.cells[mapLayout[yy][xx]];
				let model = <Cell>{
					asset: 'tile',
					blocksAttack: false,
					blocksMove: false,
					restingTint: 0xffffff,
					restingZ: 0,
				};
				if (cellConfig) {
					model = JSON.parse(JSON.stringify(cellConfig));
				}

				model.x = xx;
				model.y = yy;

				let tileSpr = this._game.add.isoSprite(model.x * this._config.cellSize, model.y * this._config.cellSize, 0, model.asset, 0, this._game['isoGridGroup']);
				tileSpr.anchor.set(0.5, 0);

				let cellType = this._cellTypeMap[mapLayout[yy][xx]];

				if (!cellType)
					cellType = GridCell;

				let newCell: GridCell = new cellType(tileSpr, model);

				cells.push(newCell);

				this._animateCell(newCell);
			}
		}
		return cells;
	}

	private _mapToBaseUnit = (unit: Unit): BaseUnit => {
		let spr = this._game.add.isoSprite(unit.x * this._config.cellSize, unit.y * this._config.cellSize, 0, `${unit.asset}_${unit.belongsToPlayer}`, 0, this._game['isoUnitsGroup']);

		spr.anchor.set(0.5, 0.3);
		return new (this._unitTypeMap[unit.name])(unit, spr);
	};
	
	private _animateCell(cell: GridCell): void {
		if (cell instanceof WaterCell) {
			let waterAnimation = this._game.add.tween(cell.spr).to({isoZ: -5}, 800, Phaser.Easing.Sinusoidal.InOut, false, 0, 0, true).loop(true);
			setTimeout(() => waterAnimation.start(), Math.random() * 1000);
		}
	}
}