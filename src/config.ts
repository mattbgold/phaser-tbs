import {Unit} from "./models/unit";
import {MapLayout} from "./models/map_layout";
import {Cell} from "./models/cell";

export interface GameConfig {
	cellSize: number;
	units: {[key:string]: Unit};
	cells: {[key: string]: Cell};
	maps: MapLayout[];
	keyConfig: {[key:string]: string}
}

export abstract class GameStates {
	static BOOT: string = 'boot';
	static PRELOAD: string = 'preload';
	static TITLE: string = 'title';
	static GAME: string = 'game';
}

export function getConfig(): GameConfig {
	return {
		keyConfig: {
			KeyAttack: 'A',
			KeyCancel: 'C',
			KeyWait: 'W'
		},
		cellSize: 38,
		maps: [{
			name: 'demo1',
			armies: [
				['scout', 'scout', 'tank', 'assault', 'assault', 'assault', 'tank'],
				['scout', 'tank', 'tank', 'scout', 'scout', 'tank', 'scout', 'assault', 'assault']
			],
			layout: [
				['W', 'W', 'W', '1', '1', '1', '1', '1', 'W', 'W', 'W', 'W'],

				['W', ' ', ' ', ' ', '1', '1', '1', '1', ' ', ' ', ' ', 'W'],

				['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],

				['W', 'B', 'W', 'W', ' ', ' ', 'M', ' ', ' ', ' ', ' ', 'W'],

				['W', ' ', ' ', 'W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],

				['W', ' ', ' ', 'W', 'W', 'B', 'B', 'W', 'W', ' ', ' ', 'W'],

				['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W', ' ', ' ', 'W'],

				['W', ' ', ' ', 'M', 'M', ' ', ' ', ' ', 'W', 'B', 'W', 'W'],

				['W', ' ', ' ', 'M', 'M', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],

				['W', ' ', ' ', ' ', ' ', '0', '0', '0', ' ', ' ', ' ', 'W'],

				['W', ' ', ' ', ' ', '0', '0', '0', '0', ' ', ' ', ' ', 'W'],

				['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
			]
		}, {
			name: 'demo2',
			armies: [
				['tank', 'tank', 'tank', 'assault'],
				['scout', 'scout', 'tank', 'assault', 'assault', 'assault'],
				['assault', 'assault', 'assault', 'assault', 'assault'],
				['scout', 'scout', 'scout', 'assault', 'tank', 'tank']
			],
			layout:
				[
				['0', '0', 'W', 'W', ' ', ' ', 'W', 'W', ' ', ' ', ' ', '1', '1'],

				[' ', '0', 'W', 'W', ' ', ' ', ' ', 'W', ' ', 'M', 'M', '1', '1'],

				['0', ' ', 'B', ' ', ' ', ' ', ' ', 'W', ' ', 'M', 'W', '1', '1'],

				['W', 'W', 'W', ' ', 'M', ' ', ' ', 'B', ' ', ' ', 'W', 'W', 'B'],

				['W', 'M', ' ', ' ', 'M', ' ', ' ', 'B', ' ', ' ', ' ', ' ', ' '],

				[' ', ' ', ' ', ' ', ' ', ' ', 'W', 'W', ' ', ' ', ' ', ' ', ' '],

				['W', 'W', 'W', ' ', ' ', ' ', 'W', 'W', ' ', ' ', ' ', ' ', ' '],

				[' ', ' ', 'W', 'B', 'B', 'W', 'W', 'W', ' ', 'M', ' ', ' ', ' '],

				['M', ' ', ' ', ' ', ' ', 'W', 'W', 'W', ' ', ' ', ' ', ' ', 'W'],

				['M', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W', 'W'],

				['M', 'M', ' ', ' ', ' ', ' ', 'M', ' ', ' ', 'W', ' ', ' ', '3'],

				['2', '2', ' ', 'M', ' ', 'M', 'M', ' ', 'W', 'W', ' ', '3', '3'],

				['2', '2', '2', 'M', ' ', ' ', ' ', ' ', 'W', 'W', '3', '3', '3'],
			]
		}, {
			name: 'demo3',
			armies: [
				['scout', 'scout', 'assault', 'assault', 'tank', 'tank'],
				['scout', 'tank', 'scout', 'scout', 'assault', 'tank','assault', 'tank']
			],
			layout: [
				['1', '1', ' ', ' ', ' ', '1', '1', ' ', ' ', ' ', ' ', '1', '1'],

				['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],

				[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W', 'W', 'W'],

				[' ', ' ', ' ', ' ', ' ', 'M', 'M', '1', 'W', 'B', 'W', 'W', 'W'],

				[' ', ' ', ' ', ' ', ' ', 'M', 'W', 'W', 'W', 'B', 'B', 'W', 'W'],

				[' ', ' ', 'W', 'W', 'B', 'W', 'W', 'W', 'W', 'W', 'B', 'W', 'W'],

				[' ', 'W', 'W', 'W', ' ', ' ', ' ', 'W', 'W', 'W', 'B', 'W', 'W'],

				[' ', 'B', 'B', ' ', ' ', ' ', 'M', ' ', ' ', 'W', 'B', 'W', 'W'],

				['W', 'W', 'W', ' ', ' ', ' ', 'M', ' ', ' ', 'W', 'B', 'W', 'W'],

				[' ', 'M', 'M', ' ', ' ', 'M', 'M', ' ', ' ', ' ', ' ', 'W', 'W'],

				[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],

				[' ', ' ', ' ', ' ', ' ', '0', '0', ' ', ' ', ' ', ' ', ' ', ' '],

				[' ', ' ', ' ', ' ', '0', '0', '0', '0', ' ', ' ', ' ', ' ', ' '],
			]
		}],
		units: {
			'scout': {
				name: 'scout',
				asset: 'unit_scout',
				stats: {
					attack: 2,
					armor: 0,
					hp: 4,
					mov: 5,
					range: 3,
					sight: 4,
					cost: 2
				},
			},
			'assault': {
				name: 'assault',
				asset: 'unit_assault',
				stats: {
					attack: 3,
					armor: 0,
					hp: 5,
					mov: 3,
					range: 3,
					sight: 3,
					cost: 3
				},
			},
			'tank': {
				name: 'tank',
				asset: 'unit_tank',
				stats: {
					attack: 3,
					armor: 2,
					hp: 4,
					mov: 4,
					range: 5,
					sight: 3,
					cost: 6
				},
			}
		},
		cells: {
			'W': {
				name: 'water',
				asset: 'tile_water',
				blocksAttack: false,
				blocksMove: true,
				restingTint: 0x4477DD,
				restingZ: -3
			},
			'M': {
				name: 'mountain',
				asset: 'tile',
				blocksAttack: true,
				blocksMove: true,
				restingTint: 0x777777,
				restingZ: 18
			},
			'B': {
				name: 'bridge',
				asset: 'tile',
				blocksAttack: false,
				blocksMove: false,
				restingTint: 0x9b7d4d,
				restingZ: 2
			}
		}
	};
}